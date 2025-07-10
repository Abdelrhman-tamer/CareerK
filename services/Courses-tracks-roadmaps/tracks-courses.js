const { pool } = require("../../config/db");

// Base URL for static files
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Format duration from minutes to "Xh Ymin"
function formatDuration(minutes) {
    if (!minutes || isNaN(minutes)) return "0min";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
}

// Helper to prepend full URL to relative image paths
function getFullImageUrl(relativePath) {
    return relativePath ? `${BASE_URL}/${relativePath}` : null;
}

// ✅ Get all tracks with correct total duration from video content
async function getAllTracksWithInfo() {
    const query = `
        SELECT 
            t.id AS track_id,
            t.name AS track_title,
            t.image_url,
            (
                SELECT COALESCE(SUM(cc.video_time_minutes), 0)
                FROM courses c
                LEFT JOIN course_contents cc ON cc.course_id = c.id AND cc.type = 'video'
                WHERE c.track_id = t.id
            ) AS total_duration_minutes,
            (
                SELECT name FROM courses 
                WHERE track_id = t.id 
                ORDER BY order_number ASC 
                LIMIT 1
            ) AS start_course,
            (
                SELECT name FROM courses 
                WHERE track_id = t.id 
                ORDER BY order_number DESC 
                LIMIT 1
            ) AS end_course,
            (
                SELECT json_agg(json_build_object(
                    'level', r.level,
                    'title', r.title,
                    'created_at', r.created_at
                ) ORDER BY r.created_at)
                FROM roadmaps r
                WHERE r.track_id = t.id
            ) AS levels
        FROM tracks t
        ORDER BY t.name;
    `;

    const result = await pool.query(query);

    return result.rows.map((row) => ({
        track_id: row.track_id,
        track_title: row.track_title,
        image_url: getFullImageUrl(row.image_url),
        total_duration: formatDuration(
            parseInt(row.total_duration_minutes, 10)
        ),
        start_course: row.start_course,
        end_course: row.end_course,
        levels: row.levels || [], // Default to empty array if null
    }));
}
// async function getAllTracksWithInfo() {
//     const query = `
//         SELECT
//             t.id AS track_id,
//             t.name AS track_title,
//             t.image_url,
//             (
//                 SELECT COALESCE(SUM(cc.video_time_minutes), 0)
//                 FROM courses c
//                 LEFT JOIN course_contents cc ON cc.course_id = c.id AND cc.type = 'video'
//                 WHERE c.track_id = t.id
//             ) AS total_duration_minutes,
//             (
//                 SELECT name FROM courses
//                 WHERE track_id = t.id
//                 ORDER BY order_number ASC
//                 LIMIT 1
//             ) AS start_course,
//             (
//                 SELECT name FROM courses
//                 WHERE track_id = t.id
//                 ORDER BY order_number DESC
//                 LIMIT 1
//             ) AS end_course
//         FROM tracks t
//         ORDER BY t.name;
//     `;

//     const result = await pool.query(query);

//     return result.rows.map((row) => ({
//         track_id: row.track_id,
//         track_title: row.track_title,
//         image_url: getFullImageUrl(row.image_url),
//         total_duration: formatDuration(
//             parseInt(row.total_duration_minutes, 10)
//         ),
//         start_course: row.start_course,
//         end_course: row.end_course,
//     }));
// }

// ✅ Get all courses for a specific track using actual content duration
async function getCoursesForTrack(trackId) {
    const query = `
      SELECT 
        t.name AS track_name,
        c.id AS course_id,
        c.name,
        c.image_url,
        COALESCE(vd.total_video_minutes, 0) AS total_video_minutes,
        COALESCE(lesson_count.total_lessons, 0) AS total_lessons,
        avg_rating.avg_rating AS average_rating
      FROM courses c
      INNER JOIN tracks t ON c.track_id = t.id

      -- Count total lessons (videos + quizzes)
      LEFT JOIN (
          SELECT course_id, COUNT(*) AS total_lessons
          FROM course_contents
          WHERE type IN ('video', 'quiz')
          GROUP BY course_id
      ) lesson_count ON c.id = lesson_count.course_id

      -- Sum total video time
      LEFT JOIN (
          SELECT course_id, SUM(video_time_minutes) AS total_video_minutes
          FROM course_contents
          WHERE type = 'video'
          GROUP BY course_id
      ) vd ON c.id = vd.course_id

      -- Average rating
      LEFT JOIN (
          SELECT course_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating
          FROM course_reviews
          GROUP BY course_id
      ) avg_rating ON c.id = avg_rating.course_id

      WHERE c.track_id = $1
      ORDER BY c.order_number ASC;
    `;

    const result = await pool.query(query, [trackId]);

    if (result.rows.length === 0) {
        return null;
    }

    const trackName = result.rows[0].track_name;

    const courses = result.rows.map((course) => ({
        course_id: course.course_id,
        name: course.name,
        image_url: getFullImageUrl(course.image_url),
        total_lessons: course.total_lessons,
        duration: formatDuration(course.total_video_minutes),
        average_rating: course.average_rating,
    }));

    return {
        track_name: trackName,
        courses,
    };
}

module.exports = {
    getAllTracksWithInfo,
    getCoursesForTrack,
};
