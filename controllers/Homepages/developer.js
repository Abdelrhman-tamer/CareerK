const {
    getDeveloperName,
    getPopularCourses,
    getTrackPreview,
    getCoursesByTrackId,
} = require("../../services/Homepages/developer");

// 🔹 GET /home/developer/name
const fetchDeveloperName = async (req, res) => {
    try {
        const developerId = req.user.id;
        const name = await getDeveloperName(developerId);
        res.status(200).json({ developerName: name });
    } catch (error) {
        console.error("Error fetching developer name:", error.message);
        res.status(500).json({ message: "Failed to fetch developer name" });
    }
};

// 🔹 GET /home/developer/courses
const fetchPopularCourses = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8; // fallback to 8 if not provided or invalid
        const courses = await getPopularCourses(limit);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching popular courses:", error.message);
        res.status(500).json({ message: "Failed to fetch popular courses" });
    }
};

// 🔹 GET /home/developer/tracks
const fetchTrackPreview = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8; // fallback to 4
        const tracks = await getTrackPreview(limit);
        res.status(200).json(tracks);
    } catch (error) {
        console.error("Error fetching track preview:", error.message);
        res.status(500).json({ message: "Failed to fetch track preview" });
    }
};

// 🔹 GET /home/developer/courses/track/:trackId
const fetchCoursesByTrack = async (req, res) => {
    try {
        const { trackId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const courses = await getCoursesByTrackId(trackId, limit);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses by track:", error.message);
        res.status(500).json({
            message: "Failed to fetch courses for this track",
        });
    }
};

module.exports = {
    fetchDeveloperName,
    fetchPopularCourses,
    fetchTrackPreview,
    fetchCoursesByTrack,
};
