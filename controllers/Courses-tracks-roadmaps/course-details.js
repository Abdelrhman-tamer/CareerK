const courseDetails = require("../../services/Courses-tracks-roadmaps/course-details");

const getCourseHeader = async (req, res) => {
    try {
        const data = await courseDetails.getCourseHeader(req.params.courseId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCourseOverview = async (req, res) => {
    try {
        const data = await courseDetails.getCourseOverview(req.params.courseId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCourseContents = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const developerId = req.user.id; // or wherever you're storing it (e.g., decoded JWT or session)

        const data = await courseDetails.getCourseContents(
            courseId,
            developerId
        );
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// const getCourseContents = async (req, res) => {
//   try {
//     const data = await courseDetails.getCourseContents(req.params.courseId);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const getCourseReviews = async (req, res) => {
    try {
        const data = await courseDetails.getCourseReviews(req.params.courseId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCourseHeader,
    getCourseOverview,
    getCourseContents,
    getCourseReviews,
};
