const { pool } = require("../config/db");

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

const toggleCourseBookmark = async (developerId, courseId) => {
    const result = await pool.query(
        `SELECT 1 FROM course_bookmarks WHERE developer_id = $1 AND course_id = $2`,
        [developerId, courseId]
    );

    if (result.rows.length > 0) {
        // Bookmark exists → remove it
        await pool.query(
            `DELETE FROM course_bookmarks WHERE developer_id = $1 AND course_id = $2`,
            [developerId, courseId]
        );
        return { bookmarked: false };
    } else {
        // Bookmark doesn't exist → add it
        await pool.query(
            `INSERT INTO course_bookmarks (developer_id, course_id) VALUES ($1, $2)`,
            [developerId, courseId]
        );
        return { bookmarked: true };
    }
};

// // Bookmark a course
// const bookmarkCourse = async (developerId, courseId) => {
//     await pool.query(
//         `INSERT INTO course_bookmarks (developer_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
//         [developerId, courseId]
//     );
// };

// // Remove bookmark
// const removeCourseBookmark = async (developerId, courseId) => {
//     await pool.query(
//         `DELETE FROM course_bookmarks WHERE developer_id = $1 AND course_id = $2`,
//         [developerId, courseId]
//     );
// };

// Get all bookmarked courses for a developer
const getBookmarkedCourses = async (developerId) => {
    const query = `
        SELECT 
            c.id AS course_id,
            c.name,
            c.image_url,
            c.description,
            ROUND(AVG(DISTINCT r.rating)::numeric, 1) AS average_rating,
            COUNT(DISTINCT cc.id) AS total_lessons,
            COALESCE(SUM(DISTINCT cc.video_time_minutes), 0) AS total_video_minutes,
            cb.bookmarked_at
        FROM course_bookmarks cb
        JOIN courses c ON cb.course_id = c.id
        LEFT JOIN course_contents cc ON c.id = cc.course_id
        LEFT JOIN course_reviews r ON c.id = r.course_id
        WHERE cb.developer_id = $1
        GROUP BY c.id, cb.bookmarked_at
        ORDER BY cb.bookmarked_at DESC
    `;

    const result = await pool.query(query, [developerId]);

    return result.rows.map((row) => ({
        course_id: row.course_id,
        name: row.name,
        image_url: getFullImageUrl(row.image_url),
        description: row.description,
        average_rating: row.average_rating,
        total_lessons: row.total_lessons,
        duration: formatDuration(row.total_video_minutes),
        bookmarked_at: row.bookmarked_at,
    }));
};

const isCourseBookmarked = async (developerId, courseId) => {
    const result = await pool.query(
        `
        SELECT EXISTS (
            SELECT 1 FROM course_bookmarks
            WHERE developer_id = $1 AND course_id = $2
        ) AS is_bookmarked
        `,
        [developerId, courseId]
    );

    return result.rows[0].is_bookmarked;
};

module.exports = {
    toggleCourseBookmark,
    getBookmarkedCourses,
    isCourseBookmarked,
};
