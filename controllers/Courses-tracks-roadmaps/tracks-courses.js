const tracksSummary = require("../../services/Courses-tracks-roadmaps/tracks-courses");

// Controller to fetch all tracks with total duration and course names
async function getAllTracks(req, res) {
    try {
        const tracks = await tracksSummary.getAllTracksWithInfo();
        res.status(200).json(tracks);
    } catch (error) {
        console.error("❌ Error getting tracks with info:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Controller to fetch all courses for a given track
async function getTrackCourses(req, res) {
    const { trackId } = req.params;

    if (!trackId) {
        return res.status(400).json({ message: "Track ID is required" });
    }

    try {
        const data = await tracksSummary.getCoursesForTrack(trackId);

        if (!data) {
            return res
                .status(404)
                .json({ message: "Track not found or has no courses" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("❌ Error getting courses for track:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    getAllTracks,
    getTrackCourses,
};

// const tracksSummary = require("../../services/Courses-tracks-roadmaps/tracks-courses");

// async function getAllTracks(req, res) {
//     try {
//         const tracks = await tracksSummary.getAllTracksWithInfo();
//         res.status(200).json(tracks);
//     } catch (error) {
//         console.error("Error getting tracks with info:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }

// const getTrackCourses = async (req, res) => {
//     const { trackId } = req.params;
//     try {
//         const courses = await tracksSummary.getCoursesForTrack(trackId);
//         res.status(200).json(courses);
//     } catch (error) {
//         console.error("❌ Error getting courses for track:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// module.exports = {
//     getAllTracks,
//     getTrackCourses,
// };
