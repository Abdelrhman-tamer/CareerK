const { pool } = require("../../config/db");
const path = require("path");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function getFullUrl(relativePath) {
    return relativePath ? `${BASE_URL}/${relativePath}` : null;
}

// 1. Header
const getCourseHeader = async (courseId) => {
    const courseRes = await pool.query(
        `SELECT name, image_url FROM courses WHERE id = $1`,
        [courseId]
    );

    const ratingRes = await pool.query(
        `SELECT ROUND(AVG(rating)::numeric, 1) as average_rating 
     FROM course_reviews 
     WHERE course_id = $1`,
        [courseId]
    );

    const videoCountRes = await pool.query(
        `SELECT COUNT(*) as video_lessons 
     FROM course_contents 
     WHERE course_id = $1 AND type = 'video'`,
        [courseId]
    );

    const firstVideoRes = await pool.query(
        `SELECT video_url 
     FROM course_contents 
     WHERE course_id = $1 AND type = 'video' AND video_url IS NOT NULL 
     ORDER BY "order" ASC 
     LIMIT 1`,
        [courseId]
    );

    return {
        name: courseRes.rows[0]?.name || "",
        imageUrl: getFullUrl(courseRes.rows[0]?.image_url), // ✅ updated here
        averageRating: parseFloat(ratingRes.rows[0]?.average_rating) || 0,
        videoLessons: parseInt(videoCountRes.rows[0]?.video_lessons) || 0,
        previewVideoUrl: firstVideoRes.rows[0]?.video_url || null,
    };
};

// 2. Overview
const getCourseOverview = async (courseId) => {
    const courseRes = await pool.query(
        `SELECT description, difficulty, has_certificate, learning_objectives 
         FROM courses 
         WHERE id = $1`,
        [courseId]
    );

    const timeRes = await pool.query(
        `SELECT COALESCE(SUM(video_time_minutes), 0) as total_minutes
         FROM course_contents
         WHERE course_id = $1 AND type = 'video'`,
        [courseId]
    );

    const totalMinutes = parseInt(timeRes.rows[0].total_minutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
        totalVideoTime: `${hours}h ${minutes}min`,
        hasCertificate: courseRes.rows[0]?.has_certificate || false,
        difficulty: courseRes.rows[0]?.difficulty || "",
        description: courseRes.rows[0]?.description || "",
        learningObjectives: courseRes.rows[0]?.learning_objectives || [], // ✅ new field
    };
};

// 3. Contents
const getCourseContents = async (courseId) => {
    const contentRes = await pool.query(
        `SELECT * FROM course_contents WHERE course_id = $1 ORDER BY "order" ASC`,
        [courseId]
    );

    const contents = await Promise.all(
        contentRes.rows.map(async (row) => {
            if (row.type === "video") {
                return {
                    id: row.id,
                    type: "video",
                    title: row.title,
                    video_time: `${row.video_time_minutes}min`,
                    video_url: row.video_url,
                };
            } else if (row.type === "quiz") {
                const quizRes = await pool.query(
                    `SELECT question, options, correct FROM quiz_questions WHERE content_id = $1`,
                    [row.id]
                );

                return {
                    id: row.id,
                    type: "quiz",
                    title: row.title,
                    questions: quizRes.rows,
                };
            }
        })
    );

    return contents;
};

// 4. Reviews
const getCourseReviews = async (courseId) => {
    const avgRes = await pool.query(
        `SELECT ROUND(AVG(rating)::numeric, 1) as average_rating 
         FROM course_reviews 
         WHERE course_id = $1`,
        [courseId]
    );

    const reviewsRes = await pool.query(
        `SELECT r.rating, r.comment, r.created_at, 
                CONCAT(d.first_name, ' ', d.last_name) AS developer,
                d.profile_picture
         FROM course_reviews r
         LEFT JOIN developers d ON r.developer_id = d.id
         WHERE r.course_id = $1
         ORDER BY r.created_at DESC`,
        [courseId]
    );

    return {
        averageRating: parseFloat(avgRes.rows[0]?.average_rating) || 0,
        reviews: reviewsRes.rows.map((r) => ({
            developer: r.developer || "Anonymous",
            profilePicture: r.profile_picture
                ? `${BASE_URL}/uploads/profile_pictures/${r.profile_picture}`
                : null,
            rating: r.rating,
            comment: r.comment,
            date: r.created_at,
        })),
    };
};

module.exports = {
    getCourseHeader,
    getCourseOverview,
    getCourseContents,
    getCourseReviews,
};
