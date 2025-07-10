const { pool } = require("../../config/db");

// 🟢 Enroll in course
const enroll = async (developerId, courseId) => {
    const existing = await pool.query(
        `SELECT 1 FROM developer_course_enrollments WHERE developer_id = $1 AND course_id = $2`,
        [developerId, courseId]
    );
    if (existing.rows.length) {
        return { status: 400, message: "Already enrolled" };
    }

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
};

// 🟡 Complete a lesson
const completeLesson = async (developerId, lessonId) => {
    const lessonRes = await pool.query(
        `SELECT course_id FROM course_contents WHERE id = $1`,
        [lessonId]
    );
    if (!lessonRes.rows.length)
        return { status: 404, message: "Lesson not found" };

    const courseId = lessonRes.rows[0].course_id;

    // Prevent duplicates
    const exists = await pool.query(
        `SELECT 1 FROM developer_lesson_progress
       WHERE developer_id = $1 AND course_id = $2 AND lesson_id = $3`,
        [developerId, courseId, lessonId]
    );
    if (exists.rows.length)
        return { status: 200, message: "Already completed" };

    await pool.query(
        `INSERT INTO developer_lesson_progress (developer_id, course_id, lesson_id)
       VALUES ($1, $2, $3)`,
        [developerId, courseId, lessonId]
    );

    // ✅ Get updated progress info
    const { progress, completed, total } = await recalculateProgress(
        developerId,
        courseId,
        lessonId
    );

    return {
        status: 200,
        message: "Lesson completed",
        progressPercentage: progress,
        completedCount: completed,
        totalCount: total,
    };
};

const recalculateProgress = async (developerId, courseId, lessonId) => {
    const totalQ = `SELECT COUNT(*) FROM course_contents WHERE course_id = $1`;
    const completedQ = `
      SELECT COUNT(*) FROM developer_lesson_progress
      WHERE developer_id = $1 AND course_id = $2
  `;

    const total = parseInt(
        (await pool.query(totalQ, [courseId])).rows[0].count
    );
    const completed = parseInt(
        (await pool.query(completedQ, [developerId, courseId])).rows[0].count
    );
    const progress = total === 0 ? 0 : Math.floor((completed / total) * 100);
    const status = progress === 100 ? "completed" : "ongoing";

    // ✅ Update course enrollment
    await pool.query(
        `UPDATE developer_course_enrollments
       SET progress_percentage = $1,
           status = $2,
           resume_lesson_id = $3,
           last_accessed_at = CURRENT_TIMESTAMP
       WHERE developer_id = $4 AND course_id = $5`,
        [progress, status, lessonId, developerId, courseId]
    );

    // ✅ Update progress table
    await pool.query(
        `UPDATE developer_course_progress
       SET completed_lessons = $1, updated_at = CURRENT_TIMESTAMP
       WHERE developer_id = $2 AND course_id = $3`,
        [completed, developerId, courseId]
    );

    // ✅ Return for frontend or caller
    return { progress, completed, total };
};

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
    enroll,
    completeLesson,
    getCoursesByStatus,
};
