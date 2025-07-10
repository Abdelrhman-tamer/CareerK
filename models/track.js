// const pool = require('../db');

// const Track = {
//   async create({ name, slug, description, industry, is_featured, created_by }) {
//     const query = `
//       INSERT INTO tracks (
//         name, slug, description, industry, is_featured, created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *;
//     `;
//     const values = [name, slug, description, industry, is_featured, created_by];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   async findById(id) {
//     const query = 'SELECT * FROM tracks WHERE id = $1';
//     const { rows } = await pool.query(query, [id]);
//     return rows[0];
//   },

//   async update(id, updates) {
//     const fields = [];
//     const values = [];
//     let paramCount = 1;

//     for (const [key, value] of Object.entries(updates)) {
//       if (['id', 'created_by', 'created_at'].includes(key)) continue;
      
//       fields.push(`${key} = $${paramCount}`);
//       values.push(value);
//       paramCount++;
//     }

//     if (fields.length === 0) {
//       throw new Error('No valid fields to update');
//     }

//     values.push(id);
//     const query = `
//       UPDATE tracks
//       SET ${fields.join(', ')}
//       WHERE id = $${paramCount}
//       RETURNING *;
//     `;
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   async getRoadmaps(trackId, type, userId) {
//     let query = `
//       SELECT r.* 
//       FROM roadmaps r
//       WHERE r.track_id = $1
//       AND (r.is_public = true OR r.created_by = $3)
//     `;
//     const values = [trackId];
    
//     if (type) {
//       query += ' AND r.type = $2';
//       values.push(type);
//     }
    
//     values.push(userId || null);
    
//     query += ' ORDER BY r.created_at DESC';
//     const { rows } = await pool.query(query, values);
//     return rows;
//   }
// };

// module.exports = Track;