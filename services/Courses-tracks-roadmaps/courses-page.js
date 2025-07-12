const { pool } = require("../../config/db");
const axios = require("axios");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function getFullImageUrl(relativePath, folder = "") {
    if (!relativePath) return null;

    // If already a full URL, return it unchanged
    if (relativePath.startsWith("http")) return relativePath;

    // Normalize path
    let cleanPath = relativePath.replace(/^\/+/, "");

    // Avoid duplicating folder if already included
    if (folder && !cleanPath.startsWith(folder)) {
        cleanPath = `${folder.replace(/\/+$/, "")}/${cleanPath}`;
    }

    return `${BASE_URL}/${cleanPath}`;
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}min`;
}

async function getProfile(developerId) {
    const result = await pool.query(
        "SELECT first_name, last_name, profile_picture FROM developers WHERE id = $1",
        [developerId]
    );

    const dev = result.rows[0];

    if (!dev) return null;

    return {
        first_name: dev.first_name,
        last_name: dev.last_name,
        profile_picture: getFullImageUrl(
            dev.profile_picture,
            "uploads/profile_pictures"
        ),
    };
}

async function searchCourses(keyword) {
    const searchTerm = `%${keyword.toLowerCase()}%`;

    const query = `
        SELECT 
            c.id,
            c.name,
            c.image_url,

            -- Total video duration
            COALESCE(vd.total_video_minutes, 0) AS total_video_minutes,

            -- Total lessons
            COALESCE(lesson_count.total_lessons, 0) AS total_lessons,

            -- Average rating
            avg_rating.avg_rating AS average_rating

        FROM courses c

        -- Sum total video time
        LEFT JOIN (
            SELECT course_id, SUM(video_time_minutes) AS total_video_minutes
            FROM course_contents
            WHERE type = 'video'
            GROUP BY course_id
        ) vd ON c.id = vd.course_id

        -- Count total lessons
        LEFT JOIN (
            SELECT course_id, COUNT(*) AS total_lessons
            FROM course_contents
            WHERE type IN ('video', 'quiz')
            GROUP BY course_id
        ) lesson_count ON c.id = lesson_count.course_id

        -- Average rating
        LEFT JOIN (
            SELECT course_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating
            FROM course_reviews
            GROUP BY course_id
        ) avg_rating ON c.id = avg_rating.course_id

        WHERE LOWER(c.name) LIKE $1
        ORDER BY avg_rating.avg_rating DESC NULLS LAST
        LIMIT 20
    `;

    const result = await pool.query(query, [searchTerm]);

    return result.rows.map((course) => ({
        id: course.id,
        name: course.name,
        image_url: getFullImageUrl(course.image_url),
        total_lessons: course.total_lessons,
        duration: formatDuration(course.total_video_minutes),
        average_rating: course.average_rating,
    }));
}

async function getTrackPreview(limit) {
    const query = `
        SELECT id AS track_id, name AS track_name, description, image_url, icon_url
        FROM tracks
        LIMIT $1
    `;
    const result = await pool.query(query, [limit]);

    return result.rows.map((track) => ({
        track_id: track.track_id,
        track_name: track.track_name,
        description: track.description,
        image_url: getFullImageUrl(track.image_url),
        icon_url: getFullImageUrl(track.icon_url),
    }));
}

const getOngoingCourses = async (developerId, status = "ongoing") => {
    if (!["ongoing", "completed"].includes(status)) {
        throw new Error("Invalid course status");
    }

    const query = `
      SELECT 
        e.course_id,
        c.name,
        c.image_url,
        c.description,
        c.difficulty,
        e.progress_percentage,
        e.resume_lesson_id,
        e.last_accessed_at
      FROM developer_course_enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.developer_id = $1 AND e.status = $2
      ORDER BY e.last_accessed_at DESC NULLS LAST;
    `;

    const result = await pool.query(query, [developerId, status]);

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

            const totalCount = parseInt(totalRes.rows[0].count);
            const completedCount = parseInt(completedRes.rows[0].count);

            return {
                ...course,
                image_url: getFullImageUrl(course.image_url),
                totalCount,
                completedCount,
            };
        })
    );

    return enrichedCourses;
};

async function getCourseStatsAndRating(courseId) {
    const query = `
        SELECT
            COALESCE(SUM(CASE WHEN cc.type = 'video' THEN cc.video_time_minutes ELSE 0 END), 0) AS total_video_minutes,
            COUNT(*) FILTER (WHERE cc.type IN ('video', 'quiz')) AS total_lessons,
            ROUND(AVG(cr.rating)::numeric, 1) AS average_rating
        FROM courses c
        LEFT JOIN course_contents cc ON c.id = cc.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.id = $1
        GROUP BY c.id
    `;

    const { rows } = await pool.query(query, [courseId]);

    if (rows.length === 0) {
        return {
            total_video_minutes: 0,
            total_lessons: 0,
            average_rating: null,
        };
    }

    const row = rows[0];
    return {
        total_video_minutes: parseInt(row.total_video_minutes, 10) || 0,
        total_lessons: parseInt(row.total_lessons, 10) || 0,
        average_rating: row.average_rating
            ? parseFloat(row.average_rating)
            : null,
    };
}

async function getRelatedCourses(developerId) {
    try {
        const response = await axios.get(
            `http://localhost:8000/courses/recommendations/${developerId}`
        );

        const courses = await Promise.all(
            response.data.map(async (course) => {
                const stats = await getCourseStatsAndRating(course.course_id);

                return {
                    ...course,
                    image_url: getFullImageUrl(course.image_url),
                    total_lessons: stats.total_lessons,
                    duration: formatDuration(stats.total_video_minutes),
                    rating: stats.average_rating,
                };
            })
        );

        return courses;
    } catch (error) {
        console.error(
            "ML course recommendation failed:",
            error.response?.data || error.message
        );
        return [];
    }
}

module.exports = {
    getProfile,
    searchCourses,
    getTrackPreview,
    getOngoingCourses,
    getRelatedCourses,
};
