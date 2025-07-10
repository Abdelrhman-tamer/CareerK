const my_courses = require('../../../services/Profiles/developerProfile/my-courses');

async function getMyCourses(req, res) {
  try {
    const developerId = req.user.id; // assuming JWT auth adds `user` to request
    const courses = await my_courses.getMyCourses(developerId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
}


const updateCourseProgress = async (req, res) => {
    try {
      const developerId = req.user.id;
      const { courseId } = req.params;
      const { progress_percentage } = req.body;
  
      if (
        typeof progress_percentage !== 'number' ||
        progress_percentage < 0 ||
        progress_percentage > 100
      ) {
        return res.status(400).json({ message: 'Invalid progress percentage' });
      }
  
      const result = await my_courses.updateCourseProgress(
        developerId,
        courseId,
        progress_percentage
      );
  
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in updateCourseProgress:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = {
  getMyCourses,
  updateCourseProgress
};
