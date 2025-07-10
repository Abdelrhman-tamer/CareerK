const { pool } = require('../../../config/db');



// 🔍 Detect whether post is a job or service
const detectPostType = async (postId) => {
  const jobCheck = await pool.query(`SELECT 1 FROM job_posts WHERE id = $1`, [postId]);
  if (jobCheck.rows.length > 0) return 'job';

  const serviceCheck = await pool.query(`SELECT 1 FROM service_posts WHERE id = $1`, [postId]);
  if (serviceCheck.rows.length > 0) return 'service';

  throw new Error('Invalid post_id');
};

// ✅ Toggle Bookmark (Auto-detect post_type)
const toggleBookmark = async (developerId, postId) => {
  const postType = await detectPostType(postId);

  const existing = await pool.query(
    `SELECT 1 FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
    [developerId, postId, postType]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `DELETE FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
      [developerId, postId, postType]
    );
    return 'Bookmark removed';
  } else {
    await pool.query(
      `INSERT INTO bookmarks (developer_id, post_id, post_type) VALUES ($1, $2, $3)`,
      [developerId, postId, postType]
    );
    return 'Bookmark added';
  }
};

// ✅ Check if a Post is Bookmarked (Auto-detect post_type)
const isBookmarked = async (developerId, postId) => {
  const postType = await detectPostType(postId);

  const { rows } = await pool.query(
    `SELECT 1 FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
    [developerId, postId, postType]
  );
  return rows.length > 0;
};

// ✅ Get Bookmarks (job/service/all)
const getBookmarks = async (developerId, postType) => {
  let query = '';
  const values = [developerId];

  if (postType === 'job') {
    query = `
      SELECT 
        b.*, 
        j.title,
        j.location,
        j.salary_range,
        j.experience_required,
        j.job_type,               -- ✨ NEW FIELD
        j.company_name,            -- ✨ NEW FIELD
        j.application_deadline,    -- ✨ NEW FIELD
        j.skills                   -- ✨ NEW FIELD
      FROM bookmarks b
      JOIN job_posts j ON j.id = b.post_id
      WHERE b.developer_id = $1 AND b.post_type = 'job'
      ORDER BY b.created_at DESC;
    `;
  } else if (postType === 'service') {
    query = `
      SELECT 
        b.*, 
        s.title,
        s.description,
        s.budget_range,
        s.service_type,
        s.required_skills,         -- ✨ NEW FIELD
        s.deadline                 -- ✨ NEW FIELD
      FROM bookmarks b
      JOIN service_posts s ON s.id = b.post_id
      WHERE b.developer_id = $1 AND b.post_type = 'service'
      ORDER BY b.created_at DESC;
    `;
  } else { // 'all' case
    query = `
      SELECT 
        b.*,
        COALESCE(j.title, s.title) AS title,
        b.post_type,
        -- Job-specific fields (NULL for services)
        j.location,
        j.salary_range,
        j.experience_required,
        j.job_type,                -- ✨ NEW FIELD
        j.company_name,             -- ✨ NEW FIELD
        j.application_deadline,     -- ✨ NEW FIELD
        j.skills,                   -- ✨ NEW FIELD
        -- Service-specific fields (NULL for jobs)
        s.description,
        s.budget_range,
        s.service_type,
        s.required_skills,          -- ✨ NEW FIELD
        s.deadline                  -- ✨ NEW FIELD
      FROM bookmarks b
      LEFT JOIN job_posts j 
        ON j.id = b.post_id AND b.post_type = 'job'
      LEFT JOIN service_posts s 
        ON s.id = b.post_id AND b.post_type = 'service'
      WHERE b.developer_id = $1
      ORDER BY b.created_at DESC;
    `;
  }

  const { rows } = await pool.query(query, values);
  return rows;
};



// const getBookmarks = async (developerId, postType) => {
//   let query = '';
//   const values = [developerId];

//   if (postType === 'job') {
//     query = `
//       SELECT b.*, j.title, j.location, j.salary_range, j.experience_required
//       FROM bookmarks b
//       JOIN job_posts j ON j.id = b.post_id
//       WHERE b.developer_id = $1 AND b.post_type = 'job'
//       ORDER BY b.created_at DESC;
//     `;
//   } else if (postType === 'service') {
//     query = `
//       SELECT b.*, s.title, s.description, s.budget_range, s.service_type
//       FROM bookmarks b
//       JOIN service_posts s ON s.id = b.post_id
//       WHERE b.developer_id = $1 AND b.post_type = 'service'
//       ORDER BY b.created_at DESC;
//     `;
//   } else {
//     query = `
//       SELECT b.*, COALESCE(j.title, s.title) AS title, b.post_type
//       FROM bookmarks b
//       LEFT JOIN job_posts j ON j.id = b.post_id AND b.post_type = 'job'
//       LEFT JOIN service_posts s ON s.id = b.post_id AND b.post_type = 'service'
//       WHERE b.developer_id = $1
//       ORDER BY b.created_at DESC;
//     `;
//   }

//   const { rows } = await pool.query(query, values);
//   return rows;
// };

module.exports = {
  toggleBookmark,
  getBookmarks,
  isBookmarked
};








//   // Toggle Bookmark Logic
// const toggleBookmark = async (developerId, postId, postType) => {
//     const existing = await pool.query(
//       `SELECT * FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
//       [developerId, postId, postType]
//     );
  
//     if (existing.rows.length > 0) {
//       await pool.query(
//         `DELETE FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
//         [developerId, postId, postType]
//       );
//       return 'Bookmark removed';
//     } else {
//       await pool.query(
//         `INSERT INTO bookmarks (developer_id, post_id, post_type) VALUES ($1, $2, $3)`,
//         [developerId, postId, postType]
//       );
//       return 'Bookmark added';
//     }
//   };
  
//   // Get Bookmarks (job/service/all)
//   const getBookmarks = async (developerId, postType) => {
//     let query = '', values = [developerId];
  
//     if (postType === 'job') {
//       query = `
//         SELECT b.*, j.title, j.location, j.salary_range, j.experience_required
//         FROM bookmarks b
//         JOIN job_posts j ON j.id = b.post_id
//         WHERE b.developer_id = $1 AND b.post_type = 'job'
//         ORDER BY b.created_at DESC;
//       `;
//     } else if (postType === 'service') {
//       query = `
//         SELECT b.*, s.title, s.description, s.budget_range, s.service_type
//         FROM bookmarks b
//         JOIN service_posts s ON s.id = b.post_id
//         WHERE b.developer_id = $1 AND b.post_type = 'service'
//         ORDER BY b.created_at DESC;
//       `;
//     } else {
//       query = `
//         SELECT b.*, COALESCE(j.title, s.title) AS title, b.post_type
//         FROM bookmarks b
//         LEFT JOIN job_posts j ON j.id = b.post_id AND b.post_type = 'job'
//         LEFT JOIN service_posts s ON s.id = b.post_id AND b.post_type = 'service'
//         WHERE b.developer_id = $1
//         ORDER BY b.created_at DESC;
//       `;
//     }
  
//     const { rows } = await pool.query(query, values);
//     return rows;
//   };
  
//   // Check Bookmark
//   const isBookmarked = async (developerId, postId, postType) => {
//     const { rows } = await pool.query(
//       `SELECT 1 FROM bookmarks WHERE developer_id = $1 AND post_id = $2 AND post_type = $3`,
//       [developerId, postId, postType]
//     );
//     return rows.length > 0;
//   };