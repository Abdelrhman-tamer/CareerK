const fs = require('fs');
const path = require('path');

// Get ordered list of courses in a track
const getCoursesByTrack = (req, res) => {
  const { track_slug } = req.params;
  const indexPath = path.join(__dirname, '../roadmaps_files/courses', track_slug, 'index.json');

  try {
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({ message: 'Track index not found' });
    }

    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const courses = indexData.courses.map(courseInfo => {
      const coursePath = path.join(__dirname, '../roadmaps_files/courses', track_slug, `${courseInfo.slug}.json`);

      if (fs.existsSync(coursePath)) {
        const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
        return courseData;
      }

      return {
        ...courseInfo,
        error: 'Course file missing'
      };
    });

    res.json({
      track: indexData.track,
      title: indexData.title,
      courses
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to load courses', error: error.message });
  }
};

// Get individual course
const getCourseBySlug = (req, res) => {
  const { track_slug, slug } = req.params;
  const filePath = path.join(__dirname, '../roadmaps_files/courses', track_slug, `${slug}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error reading course', error: error.message });
  }
};

module.exports = {
  getCoursesByTrack,
  getCourseBySlug
};

