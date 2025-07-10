const pool = require('../config/db');

// GET all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET course details by slug (with videos and reviews)
exports.getCourseDetails = async (req, res) => {
  const { slug } = req.params;
  try {
    const courseQuery = 'SELECT * FROM courses WHERE slug = $1';
    const { rows: courseRows } = await pool.query(courseQuery, [slug]);

    if (!courseRows.length) return res.status(404).json({ message: 'Course not found' });

    const course = courseRows[0];

    const videoQuery = 'SELECT * FROM course_videos WHERE course_id = $1 ORDER BY order_index ASC';
    const { rows: videos } = await pool.query(videoQuery, [course.id]);

    const reviewQuery = `
      SELECT r.*, d.first_name, d.last_name
      FROM course_reviews r
      JOIN developer d ON r.developer_id = d.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
    `;
    const { rows: reviews } = await pool.query(reviewQuery, [course.id]);

    res.json({ course, videos, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST new course
exports.createCourse = async (req, res) => {
  const { title, slug, description, level, duration, thumbnail, track_id, roadmap_id, created_by } = req.body;
  try {
    const insertQuery = `
      INSERT INTO courses (title, slug, description, level, duration, thumbnail, track_id, roadmap_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [title, slug, description, level, duration, thumbnail, track_id, roadmap_id, created_by]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update course
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, level, duration, thumbnail } = req.body;
  try {
    const updateQuery = `
      UPDATE courses SET title = $1, description = $2, level = $3, duration = $4, thumbnail = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [title, description, level, duration, thumbnail, id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
