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

// 🔹 Get developer full name
const getDeveloperName = async (developerId) => {
    const result = await pool.query(
        `SELECT first_name, last_name FROM developers WHERE id = $1`,
        [developerId]
    );

    const developer = result.rows[0];
    if (!developer) {
        throw new Error(`Developer with ID ${developerId} not found.`);
    }

    return `${developer.first_name} ${developer.last_name}`;
};

// 🔹 Get latest/popular courses (limit = 4)
const getPopularCourses = async (limit = 8) => {
    const result = await pool.query(
        `
        SELECT id, name, rating, description, image_url
        FROM courses
        ORDER BY created_at DESC
        LIMIT $1
        `,
        [limit]
    );

    return result.rows.map((course) => ({
        id: course.id,
        name: course.name,
        rating: course.rating,
        description: course.description,
        image_url: getFullImageUrl(course.image_url),
    }));
};

// 🔹 Get preview of learning tracks
const getTrackPreview = async (limit = 8) => {
    const result = await pool.query(
        `
        SELECT id AS track_id, name AS track_name, description, image_url
        FROM tracks
        LIMIT $1
        `,
        [limit]
    );

    return result.rows.map((track) => ({
        track_id: track.track_id,
        track_name: track.track_name,
        description: track.description,
        image_url: getFullImageUrl(track.image_url),
    }));
};

// 🔹 Get courses by track ID
const getCoursesByTrackId = async (trackId, limit = 10) => {
    const query = `
      SELECT 
        c.id AS course_id,
        c.name,
        c.image_url,
        c.total_lessons,
        COALESCE(vd.total_video_minutes, 0) AS total_video_minutes,
        ROUND(AVG(r.rating)::numeric, 1) AS average_rating
      FROM courses c
      LEFT JOIN (
          SELECT course_id, SUM(video_time_minutes) AS total_video_minutes
          FROM course_contents
          WHERE type = 'video'
          GROUP BY course_id
      ) vd ON c.id = vd.course_id
      LEFT JOIN course_reviews r ON c.id = r.course_id
      WHERE c.track_id = $1
      GROUP BY c.id, vd.total_video_minutes
      ORDER BY c.order_number ASC
      LIMIT $2
    `;

    const result = await pool.query(query, [trackId, limit]);

    return result.rows.map((course) => ({
        course_id: course.course_id,
        name: course.name,
        image_url: getFullImageUrl(course.image_url),
        total_lessons: course.total_lessons,
        duration: formatDuration(course.total_video_minutes),
        average_rating: course.average_rating,
    }));
};

module.exports = {
    getDeveloperName,
    getPopularCourses,
    getTrackPreview,
    getCoursesByTrackId,
};
