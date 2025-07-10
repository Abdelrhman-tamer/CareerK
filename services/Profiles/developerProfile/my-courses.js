const { pool } = require("../../../config/db");

const BASE_URL = process.env.BASE_URL;

const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    return `${BASE_URL}/${relativePath}`;
};

const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

const getMyCourses = async (developerId) => {
    const query = `
    SELECT 
      e.course_id,
      c.name,
      c.description,
      c.image_url,
      c.difficulty,
      e.progress_percentage,
      e.resume_lesson_id,
      e.last_accessed_at
    FROM developer_course_enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.developer_id = $1
    ORDER BY e.last_accessed_at DESC NULLS LAST;
  `;

    const result = await pool.query(query, [developerId]);

    const enrichedCourses = await Promise.all(
        result.rows.map(async (course) => {
            const courseId = course.course_id;

            const totalRes = await pool.query(
                `SELECT COUNT(*) FROM course_contents WHERE course_id = $1`,
                [courseId]
            );
            const completedRes = await pool.query(
                `SELECT COUNT(*) FROM developer_lesson_progress
         WHERE developer_id = $1 AND course_id = $2`,
                [developerId, courseId]
            );
            const durationRes = await pool.query(
                `SELECT COALESCE(SUM(video_time_minutes), 0) AS total_minutes
         FROM course_contents
         WHERE course_id = $1 AND type = 'video'`,
                [courseId]
            );

            const totalCount = parseInt(totalRes.rows[0].count);
            const completedCount = parseInt(completedRes.rows[0].count);
            const totalMinutes = parseInt(durationRes.rows[0].total_minutes);
            const formattedDuration = formatDuration(totalMinutes);

            return {
                ...course,
                image_url: getFullImageUrl(course.image_url),
                duration: formattedDuration,
                totalCount,
                completedCount,
            };
        })
    );

    return enrichedCourses;
};
// const getMyCourses = async (developerId) => {
//   const query = `
//     SELECT
//       c.id AS course_id,
//       c.title,
//       c.slug,
//       c.description,
//       c.level,
//       c.duration,
//       c.thumbnail,
//       dcp.progress_percentage,
//       dcp.updated_at
//     FROM developer_course_progress dcp
//     JOIN courses c ON dcp.course_id = c.id
//     WHERE dcp.developer_id = $1
//     ORDER BY dcp.updated_at DESC;
//   `;

//   const result = await pool.query(query, [developerId]);
//   return result.rows;
// }

const updateCourseProgress = async (
    developerId,
    courseId,
    progressPercentage
) => {
    const checkQuery = `
      SELECT * FROM developer_course_progress
      WHERE developer_id = $1 AND course_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [developerId, courseId]);

    if (checkResult.rows.length > 0) {
        // Update existing progress
        const updateQuery = `
        UPDATE developer_course_progress
        SET progress_percentage = $1, updated_at = NOW()
        WHERE developer_id = $2 AND course_id = $3
      `;
        await pool.query(updateQuery, [
            progressPercentage,
            developerId,
            courseId,
        ]);
    } else {
        // Insert new progress
        const insertQuery = `
        INSERT INTO developer_course_progress (developer_id, course_id, progress_percentage)
        VALUES ($1, $2, $3)
      `;
        await pool.query(insertQuery, [
            developerId,
            courseId,
            progressPercentage,
        ]);
    }

    return { message: "Progress updated" };
};

module.exports = {
    getMyCourses,
    updateCourseProgress,
};
