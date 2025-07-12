const { pool } = require("../../config/db");

// 🟢 Toggle enrollment (enroll or unenroll)
const toggleEnrollment = async (developerId, courseId) => {
    const existing = await pool.query(
        `SELECT 1 FROM developer_course_enrollments WHERE developer_id = $1 AND course_id = $2`,
        [developerId, courseId]
    );

    if (existing.rows.length) {
        // Unenroll
        await pool.query(
            `DELETE FROM developer_lesson_progress WHERE developer_id = $1 AND course_id = $2`,
            [developerId, courseId]
        );
        await pool.query(
            `DELETE FROM developer_course_progress WHERE developer_id = $1 AND course_id = $2`,
            [developerId, courseId]
        );
        await pool.query(
            `DELETE FROM developer_course_enrollments WHERE developer_id = $1 AND course_id = $2`,
            [developerId, courseId]
        );
        return { status: 200, message: "Unenrolled successfully" };
    } else {
        // Enroll
        await pool.query(
            `INSERT INTO developer_course_enrollments (developer_id, course_id)
             VALUES ($1, $2)`,
            [developerId, courseId]
        );
        await pool.query(
            `INSERT INTO developer_course_progress (developer_id, course_id)
             VALUES ($1, $2)
             ON CONFLICT (developer_id, course_id) DO NOTHING`,
            [developerId, courseId]
        );
        return { status: 201, message: "Enrolled successfully" };
    }
};

// 🟡 Toggle lesson completion (complete or uncomplete)
const toggleLessonCompletion = async (developerId, lessonId) => {
    const lessonRes = await pool.query(
        `SELECT course_id FROM course_contents WHERE id = $1`,
        [lessonId]
    );
    if (!lessonRes.rows.length)
        return { status: 404, message: "Lesson not found" };

    const courseId = lessonRes.rows[0].course_id;

    const exists = await pool.query(
        `SELECT 1 FROM developer_lesson_progress
         WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
        [developerId, courseId, lessonId]
    );

    const { rows: skillRows } = await pool.query(
        `SELECT cs.skill_id, cs.skill_weight, c.total_lessons
         FROM course_skills cs
         JOIN courses c ON c.id = cs.course_id
         WHERE cs.course_id = $1`,
        [courseId]
    );

    if (exists.rows.length) {
        // 🧹 Uncomplete lesson
        await pool.query(
            `DELETE FROM developer_lesson_progress
             WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
            [developerId, courseId, lessonId]
        );

        // ⬇️ Decrease skill progress
        for (const { skill_id, skill_weight, total_lessons } of skillRows) {
            const decrement = Math.ceil(skill_weight / total_lessons);
            await pool.query(
                `UPDATE developer_skills
                 SET progress_percentage = GREATEST(progress_percentage - $1, 0)
                 WHERE developer_id = $2 AND skill_id = $3`,
                [decrement, developerId, skill_id]
            );
        }

        const { progress, completed, total } = await recalculateProgress(
            developerId,
            courseId,
            lessonId
        );
        return {
            status: 200,
            message: "Lesson unmarked as completed",
            progressPercentage: progress,
            completedCount: completed,
            totalCount: total,
        };
    } else {
        // ✅ Complete lesson
        await pool.query(
            `INSERT INTO developer_lesson_progress (developer_id, course_id, lesson_id)
             VALUES ($1, $2, $3)`,
            [developerId, courseId, lessonId]
        );

        // ⬆️ Increase skill progress
        for (const { skill_id, skill_weight, total_lessons } of skillRows) {
            const increment = Math.ceil(skill_weight / total_lessons);
            await pool.query(
                `INSERT INTO developer_skills (developer_id, skill_id, progress_percentage)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (developer_id, skill_id)
                 DO UPDATE SET progress_percentage = LEAST(
                     developer_skills.progress_percentage + $3, 100
                 )`,
                [developerId, skill_id, increment]
            );
        }

        const { progress, completed, total } = await recalculateProgress(
            developerId,
            courseId,
            lessonId
        );
        return {
            status: 200,
            message: "Lesson marked as completed",
            progressPercentage: progress,
            completedCount: completed,
            totalCount: total,
        };
    }
};

// const toggleLessonCompletion = async (developerId, lessonId) => {
//     const lessonRes = await pool.query(
//         `SELECT course_id FROM course_contents WHERE id = $1`,
//         [lessonId]
//     );
//     if (!lessonRes.rows.length)
//         return { status: 404, message: "Lesson not found" };

//     const courseId = lessonRes.rows[0].course_id;

//     const exists = await pool.query(
//         `SELECT 1 FROM developer_lesson_progress
//          WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
//         [developerId, courseId, lessonId]
//     );

//     if (exists.rows.length) {
//         // Uncomplete
//         await pool.query(
//             `DELETE FROM developer_lesson_progress
//              WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
//             [developerId, courseId, lessonId]
//         );
//         const { progress, completed, total } = await recalculateProgress(
//             developerId,
//             courseId,
//             lessonId
//         );
//         return {
//             status: 200,
//             message: "Lesson unmarked as completed",
//             progressPercentage: progress,
//             completedCount: completed,
//             totalCount: total,
//         };
//     } else {
//         // Complete
//         await pool.query(
//             `INSERT INTO developer_lesson_progress (developer_id, course_id, lesson_id)
//              VALUES ($1, $2, $3)`,
//             [developerId, courseId, lessonId]
//         );
//         const { progress, completed, total } = await recalculateProgress(
//             developerId,
//             courseId,
//             lessonId
//         );
//         return {
//             status: 200,
//             message: "Lesson marked as completed",
//             progressPercentage: progress,
//             completedCount: completed,
//             totalCount: total,
//         };
//     }
// };

const getDeveloperSkills = async (developerId) => {
    const result = await pool.query(
        `SELECT
            ds.skill_id,
            s.name AS skill_name,
            ds.progress_percentage
         FROM developer_skills ds
         JOIN skills s ON s.id = ds.skill_id
         WHERE ds.developer_id = $1
         ORDER BY ds.progress_percentage DESC, s.name`,
        [developerId]
    );

    return result.rows;
};

// ✅ Progress recalculation
const recalculateProgress = async (developerId, courseId, lessonId) => {
    const total = parseInt(
        (
            await pool.query(
                `SELECT COUNT(*) FROM course_contents WHERE course_id = $1`,
                [courseId]
            )
        ).rows[0].count
    );
    const completed = parseInt(
        (
            await pool.query(
                `SELECT COUNT(*) FROM developer_lesson_progress WHERE developer_id = $1 AND course_id = $2`,
                [developerId, courseId]
            )
        ).rows[0].count
    );
    const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);
    const status = progress === 100 ? "completed" : "ongoing";

    await pool.query(
        `UPDATE developer_course_enrollments
         SET progress_percentage = $1,
             status = $2,
             resume_lesson_id = $3,
             last_accessed_at = CURRENT_TIMESTAMP
         WHERE developer_id = $4 AND course_id = $5`,
        [progress, status, lessonId, developerId, courseId]
    );

    await pool.query(
        `UPDATE developer_course_progress
         SET completed_lessons = $1, updated_at = CURRENT_TIMESTAMP
         WHERE developer_id = $2 AND course_id = $3`,
        [completed, developerId, courseId]
    );

    return { progress, completed, total };
};

// // 🟢 Enroll in course
// const enroll = async (developerId, courseId) => {
//     const existing = await pool.query(
//         `SELECT 1 FROM developer_course_enrollments WHERE developer_id = $1 AND course_id = $2`,
//         [developerId, courseId]
//     );
//     if (existing.rows.length) {
//         return { status: 400, message: "Already enrolled" };
//     }

//     await pool.query(
//         `INSERT INTO developer_course_enrollments (developer_id, course_id)
//      VALUES ($1, $2)`,
//         [developerId, courseId]
//     );

//     await pool.query(
//         `INSERT INTO developer_course_progress (developer_id, course_id)
//      VALUES ($1, $2)
//      ON CONFLICT (developer_id, course_id) DO NOTHING`,
//         [developerId, courseId]
//     );

//     return { status: 201, message: "Enrolled successfully" };
// };

// // 🟡 Complete a lesson
// const completeLesson = async (developerId, lessonId) => {
//     const lessonRes = await pool.query(
//         `SELECT course_id FROM course_contents WHERE id = $1`,
//         [lessonId]
//     );
//     if (!lessonRes.rows.length)
//         return { status: 404, message: "Lesson not found" };

//     const courseId = lessonRes.rows[0].course_id;

//     // Prevent duplicates
//     const exists = await pool.query(
//         `SELECT 1 FROM developer_lesson_progress
//        WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
//         [developerId, courseId, lessonId]
//     );
//     if (exists.rows.length)
//         return { status: 200, message: "Already completed" };

//     await pool.query(
//         `INSERT INTO developer_lesson_progress (developer_id, course_id, lesson_id)
//        VALUES ($1, $2, $3)`,
//         [developerId, courseId, lessonId]
//     );

//     // ✅ Get updated progress info
//     const { progress, completed, total } = await recalculateProgress(
//         developerId,
//         courseId,
//         lessonId
//     );

//     return {
//         status: 200,
//         message: "Lesson completed",
//         progressPercentage: progress,
//         completedCount: completed,
//         totalCount: total,
//     };
// };

// const recalculateProgress = async (developerId, courseId, lessonId) => {
//     const totalQ = `SELECT COUNT(*) FROM course_contents WHERE course_id = $1`;
//     const completedQ = `
//       SELECT COUNT(*) FROM developer_lesson_progress
//       WHERE developer_id = $1 AND course_id = $2
//   `;

//     const total = parseInt(
//         (await pool.query(totalQ, [courseId])).rows[0].count
//     );
//     const completed = parseInt(
//         (await pool.query(completedQ, [developerId, courseId])).rows[0].count
//     );
//     const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);
//     const status = progress === 100 ? "completed" : "ongoing";

//     // ✅ Update course enrollment
//     await pool.query(
//         `UPDATE developer_course_enrollments
//        SET progress_percentage = $1,
//            status = $2,
//            resume_lesson_id = $3,
//            last_accessed_at = CURRENT_TIMESTAMP
//        WHERE developer_id = $4 AND course_id = $5`,
//         [progress, status, lessonId, developerId, courseId]
//     );

//     // ✅ Update progress table
//     await pool.query(
//         `UPDATE developer_course_progress
//        SET completed_lessons = $1, updated_at = CURRENT_TIMESTAMP
//        WHERE developer_id = $2 AND course_id = $3`,
//         [completed, developerId, courseId]
//     );

//     // ✅ Return for frontend or caller
//     return { progress, completed, total };
// };

// 🟢 Fetch courses by status
const getCoursesByStatus = async (developerId, status) => {
    const result = await pool.query(
        `
    SELECT 
      e.course_id,
      c.name, c.image_url, c.total_lessons,
      e.progress_percentage, e.status,
      e.resume_lesson_id, e.last_accessed_at
    FROM developer_course_enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.developer_id = $1 AND e.status = $2
    ORDER BY e.enrolled_at DESC
  `,
        [developerId, status]
    );

    return result.rows;
};

module.exports = {
    toggleEnrollment,
    toggleLessonCompletion,
    getCoursesByStatus,
    getDeveloperSkills,
};
