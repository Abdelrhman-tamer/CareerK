const service = require("../../services/Courses-tracks-roadmaps/course-enrollment-progress");

exports.enrollInCourse = async (req, res) => {
    const developerId = req.user.id;
    const courseId = req.params.courseId;
    const result = await service.enroll(developerId, courseId);
    res.status(result.status).json(result);
};

exports.completeLesson = async (req, res) => {
    const developerId = req.user.id;
    const { lessonId } = req.body;

    if (!lessonId || typeof lessonId !== "string")
        return res
            .status(400)
            .json({ message: "Invalid or missing lessonId." });

    const result = await service.completeLesson(developerId, lessonId);
    res.status(result.status).json(result);
};

exports.getOngoingCourses = async (req, res) => {
    const result = await service.getCoursesByStatus(req.user.id, "ongoing");
    res.json(result);
};

exports.getCompletedCourses = async (req, res) => {
    const result = await service.getCoursesByStatus(req.user.id, "completed");
    res.json(result);
};
