const saved_posts = require('../../../services/Profiles/developerProfile/saved-posts');

// ✅ Toggle Bookmark (No need to pass post_type)
const toggleBookmark = async (req, res) => {
  try {
    const developerId = req.user.id;
    const { post_id } = req.body;

    if (!post_id) {
      return res.status(400).json({ message: 'post_id is required' });
    }

    const result = await saved_posts.toggleBookmark(developerId, post_id);
    return res.json({ message: result });
  } catch (error) {
    console.error("❌ Error in toggleBookmark:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

// ✅ Get all Bookmarks for a Developer
const getBookmarks = async (req, res) => {
  try {
    const developerId = req.user.id;
    const { postType } = req.query;

    if (postType && !['job', 'service'].includes(postType)) {
      return res.status(400).json({ message: 'Invalid postType filter' });
    }

    const bookmarks = await saved_posts.getBookmarks(developerId, postType);
    res.json(bookmarks);
  } catch (error) {
    console.error("❌ Error in getBookmarks:", error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Check if a Post is Bookmarked (No post_type required)
const isBookmarked = async (req, res) => {
  try {
    const developerId = req.user.id;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: 'postId is required' });
    }

    const isSaved = await saved_posts.isBookmarked(developerId, postId);
    res.json({ bookmarked: isSaved });
  } catch (error) {
    console.error("❌ Error in isBookmarked:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks,
  isBookmarked
};









// const saved_posts = require('../../services/developerProfile/saved-posts');




//   // Toggle Bookmark (Add/Remove)
// const toggleBookmark = async (req, res) => {
//     try {
//       const developerId = req.user.id;
//       const { post_id, post_type } = req.body;
  
//       if (!post_id || !['job', 'service'].includes(post_type)) {
//         return res.status(400).json({ message: 'Invalid post_id or post_type' });
//       }
  
//       const result = await saved_posts.toggleBookmark(developerId, post_id, post_type);
//       return res.json({ message: result });
//     } catch (error) {
//       console.error("❌ Error in toggleBookmark:", error.message);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };
  
//   // Get all Bookmarks for a Developer
//   const getBookmarks = async (req, res) => {
//     try {
//       const developerId = req.user.id;
//       const { postType } = req.query;
  
//       const bookmarks = await saved_posts.getBookmarks(developerId, postType);
//       res.json(bookmarks);
//     } catch (error) {
//       console.error("❌ Error in getBookmarks:", error.message);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };
  
//   // Check if a Post is Bookmarked
//   const isBookmarked = async (req, res) => {
//     try {
//       const developerId = req.user.id;
//       const { postId } = req.params;
//       const { post_type } = req.query;
  
//       if (!['job', 'service'].includes(post_type)) {
//         return res.status(400).json({ message: 'Invalid post_type' });
//       }
  
//       const isSaved = await saved_posts.isBookmarked(developerId, postId, post_type);
//       res.json({ bookmarked: isSaved });
//     } catch (error) {
//       console.error("❌ Error in isBookmarked:", error.message);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };


  // module.exports = {toggleBookmark,
  //   getBookmarks,
  //   isBookmarked}