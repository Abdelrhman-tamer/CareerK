const service = require("../../services/Courses-tracks-roadmaps/course-enrollment-progress");

exports.toggleEnrollment = async (req, res) => {
    const developerId = req.user.id;
    const courseId = req.params.courseId;
    const result = await service.toggleEnrollment(developerId, courseId);
    res.status(result.status).json(result);
};

exports.toggleLessonCompletion = async (req, res) => {
    const developerId = req.user.id;
    const { lessonId } = req.body;

    if (!lessonId || typeof lessonId !== "string")
        return res
            .status(400)
            .json({ message: "Invalid or missing lessonId." });

    const result = await service.toggleLessonCompletion(developerId, lessonId);
    res.status(result.status).json(result);
};

// exports.enrollInCourse = async (req, res) => {
//     const developerId = req.user.id;
//     const courseId = req.params.courseId;
//     const result = await service.enroll(developerId, courseId);
//     res.status(result.status).json(result);
// };

// exports.completeLesson = async (req, res) => {
//     const developerId = req.user.id;
//     const { lessonId } = req.body;

//     if (!lessonId || typeof lessonId !== "string")
//         return res
//             .status(400)
//             .json({ message: "Invalid or missing lessonId." });

//     const result = await service.completeLesson(developerId, lessonId);
//     res.status(result.status).json(result);
// };

exports.fetchMySkills = async (req, res) => {
    try {
        const skills = await service.getDeveloperSkills(req.user.id);
        res.json({ success: true, skills });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOngoingCourses = async (req, res) => {
    const result = await service.getCoursesByStatus(req.user.id, "ongoing");
    res.json(result);
};

exports.getCompletedCourses = async (req, res) => {
    const result = await service.getCoursesByStatus(req.user.id, "completed");
    res.json(result);
};
