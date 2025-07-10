const {
    bookmarkCourse,
    removeCourseBookmark,
    toggleCourseBookmark,
    getBookmarkedCourses,
    isCourseBookmarked,
} = require("../services/course-bookmarks");

// const addCourseBookmark = async (req, res) => {
//     try {
//         const developerId = req.user.id;
//         const { courseId } = req.body;

//         console.log("🧪 req.body:", req.body);
//         console.log("🧪 req.user:", req.user);

//         if (!courseId) {
//             return res.status(400).json({ message: "courseId is required" });
//         }

//         await bookmarkCourse(developerId, courseId);
//         res.status(201).json({ message: "Course bookmarked successfully" });
//     } catch (err) {
//         console.error("Error bookmarking course:", err.message);
//         res.status(500).json({ message: "Failed to bookmark course" });
//     }
// };

// const deleteCourseBookmark = async (req, res) => {
//     try {
//         const developerId = req.user.id;
//         const { courseId } = req.params;
//         await removeCourseBookmark(developerId, courseId);
//         res.status(200).json({ message: "Bookmark removed successfully" });
//     } catch (err) {
//         console.error("Error removing bookmark:", err.message);
//         res.status(500).json({ message: "Failed to remove bookmark" });
//     }
// };

const toggleBookmark = async (req, res) => {
    const developerId = req.user.id;
    const { courseId } = req.params;

    try {
        const result = await toggleCourseBookmark(developerId, courseId);
        res.json({
            success: true,
            message: result.bookmarked
                ? "Course bookmarked"
                : "Bookmark removed",
            bookmarked: result.bookmarked,
        });
    } catch (err) {
        console.error("Toggle bookmark error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const fetchBookmarkedCourses = async (req, res) => {
    try {
        const developerId = req.user.id;
        const bookmarks = await getBookmarkedCourses(developerId);
        res.status(200).json(bookmarks);
    } catch (err) {
        console.error("Error fetching bookmarks:", err.message);
        res.status(500).json({ message: "Failed to fetch bookmarked courses" });
    }
};

const checkIfBookmarked = async (req, res) => {
    try {
        const developerId = req.user.id;
        const { courseId } = req.params;

        const isBookmarked = await isCourseBookmarked(developerId, courseId);

        res.status(200).json({ is_bookmarked: isBookmarked });
    } catch (err) {
        console.error("Error checking course bookmark:", err.message);
        res.status(500).json({ message: "Failed to check course bookmark" });
    }
};

module.exports = {
    toggleBookmark,
    fetchBookmarkedCourses,
    checkIfBookmarked,
};
