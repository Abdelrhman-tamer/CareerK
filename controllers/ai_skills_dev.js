const { extractSkillsFromLesson } = require("../services/ai_skills_dev");

const extractLessonSkills = async (req, res) => {
    try {
        const { course_content_id, title, description, transcript } = req.body;

        if (!course_content_id || !title) {
            return res.status(400).json({
                success: false,
                message: "course_content_id and title are required",
            });
        }

        const result = await extractSkillsFromLesson({
            course_content_id,
            title,
            description,
            transcript,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Skill extraction error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to extract and save skills",
            error: error.message,
        });
    }
};

module.exports = {
    extractLessonSkills,
};
