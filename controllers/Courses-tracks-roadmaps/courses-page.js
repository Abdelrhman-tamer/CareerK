const courses_page = require("../../services/Courses-tracks-roadmaps/courses-page");

async function getProfile(req, res) {
    const developerId = req.user.id;
    const developer = await courses_page.getProfile(developerId);
    if (!developer)
        return res.status(404).json({ message: "Developer not found" });
    res.json(developer);
}

async function searchCourses(req, res) {
    const keyword = req.query.search || "";
    const results = await courses_page.searchCourses(keyword);
    res.json(results);
}

async function getTrackPreview(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const tracks = await courses_page.getTrackPreview(limit);
        res.status(200).json(tracks);
    } catch (error) {
        console.error("Error fetching track preview:", error.message);
        res.status(500).json({ message: "Failed to fetch track preview" });
    }
}

async function getOngoingCourses(req, res) {
    const developerId = req.user.id;
    const status = req.query.status || "ongoing"; // Default to ongoing

    if (!["ongoing", "completed"].includes(status)) {
        return res
            .status(400)
            .json({ message: "Invalid status. Use 'ongoing' or 'completed'." });
    }

    try {
        const result = await courses_page.getOngoingCourses(
            developerId,
            status
        );
        res.json(result);
    } catch (err) {
        console.error("Error getting courses:", err);
        res.status(500).json({ message: "Failed to retrieve courses" });
    }
}

async function getRelatedCourses(req, res) {
    const developerId = req.user.id; // ✅ Must extract `.id`, not the full object
    const result = await courses_page.getRelatedCourses(developerId);
    res.json(result);
}

module.exports = {
    getProfile,
    searchCourses,
    getTrackPreview,
    getOngoingCourses,
    getRelatedCourses,
};
