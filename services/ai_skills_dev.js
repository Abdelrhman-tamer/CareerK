const { pool } = require("../config/db");
const axios = require("axios");
const BASE_AI_URL = process.env.AI_API_URL || "http://localhost:8000";

const extractSkillsFromLesson = async (lessonData) => {
    const {
        course_content_id,
        title,
        description = "",
        transcript = "",
    } = lessonData;

    // Step 1: Send to FastAPI
    const aiRes = await axios.post(`${BASE_AI_URL}/extract`, {
        title,
        description,
        transcript,
    });

    const skills = aiRes.data.skills;

    // Step 2: Loop through skills and insert into DB
    for (const skill of skills) {
        const { name, weight } = skill;

        // Step 2a: Ensure skill exists in 'skills' table
        const skillResult = await pool.query(
            `INSERT INTO skills (name)
             VALUES ($1)
             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [name]
        );

        const skillId = skillResult.rows[0].id;

        // Step 2b: Upsert into lesson_skills
        await pool.query(
            `INSERT INTO lesson_skills (course_content_id, skill_id, skill_weight, source)
             VALUES ($1, $2, $3, 'ai')
             ON CONFLICT (course_content_id, skill_id)
             DO UPDATE SET skill_weight = EXCLUDED.skill_weight`,
            [course_content_id, skillId, weight]
        );
    }

    return {
        message: "Skills extracted and saved successfully",
        skills,
    };
};

module.exports = {
    extractSkillsFromLesson,
};
