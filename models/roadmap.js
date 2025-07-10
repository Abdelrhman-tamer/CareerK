// const pool = require('../config/db');



// const Roadmap = {
//   async create({
//     title, slug, type, track_id, created_by, description, 
//     difficulty_level, estimated_duration, is_public, steps
//   }) {
//     const query = `
//       INSERT INTO roadmaps (
//         title, slug, type, track_id, created_by, description,
//         difficulty_level, estimated_duration, is_public, steps
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING *;
//     `;
//     const values = [
//       title, slug, type, track_id, created_by, description,
//       difficulty_level, estimated_duration, is_public, steps
//     ];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   async findAllByType(type) {
//     const query = 'SELECT * FROM roadmaps WHERE type = $1 ORDER BY created_at DESC';
//     const { rows } = await pool.query(query, [type]);
//     return rows;
//   },
  
//   async findStandardBySlug(slug) {
//     const query = 'SELECT * FROM roadmaps WHERE type = $1 AND slug = $2';
//     const { rows } = await pool.query(query, ['standard', slug]);
//     return rows[0];
//   },

//   async findById(id) {
//     const query = 'SELECT * FROM roadmaps WHERE id = $1';
//     const { rows } = await pool.query(query, [id]);
//     return rows[0];
//   },

//   async update(id, updates) {
//     const fields = [];
//     const values = [];
//     let paramCount = 1;

//     for (const [key, value] of Object.entries(updates)) {
//       // Skip these fields as they shouldn't be updated directly
//       if (['id', 'created_by', 'created_at', 'type'].includes(key)) continue;
      
//       fields.push(`${key} = $${paramCount}`);
//       values.push(value);
//       paramCount++;
//     }

//     if (fields.length === 0) {
//       throw new Error('No valid fields to update');
//     }

//     values.push(id);
//     const query = `
//       UPDATE roadmaps
//       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $${paramCount}
//       RETURNING *;
//     `;
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   async getByTrack(trackId, type, userId) {
//     let query = `
//       SELECT * FROM roadmaps 
//       WHERE track_id = $1 
//       AND (is_public = true OR created_by = $3)
//     `;
//     const values = [trackId, userId];
    
//     if (type) {
//       query += ' AND type = $2';
//       values.splice(1, 0, type);
//     } else {
//       values.push(userId);
//     }

//     query += ' ORDER BY created_at DESC';
//     const { rows } = await pool.query(query, values);
//     return rows;
//   },

//   async getUserProgress(userId, roadmapId) {
//     const query = `
//       SELECT * FROM user_roadmap_progress
//       WHERE user_id = $1 AND roadmap_id = $2;
//     `;
//     const { rows } = await pool.query(query, [userId, roadmapId]);
//     return rows[0];
//   },

//   async updateUserProgress(userId, roadmapId, completedSteps, currentStep, isCompleted) {
//     const query = `
//       INSERT INTO user_roadmap_progress (
//         user_id, roadmap_id, completed_steps, current_step, is_completed
//       )
//       VALUES ($1, $2, $3, $4, $5)
//       ON CONFLICT (user_id, roadmap_id)
//       DO UPDATE SET
//         completed_steps = EXCLUDED.completed_steps,
//         current_step = EXCLUDED.current_step,
//         is_completed = EXCLUDED.is_completed,
//         last_updated_at = CURRENT_TIMESTAMP
//       RETURNING *;
//     `;
//     const values = [
//       userId,
//       roadmapId,
//       completedSteps,
//       currentStep,
//       isCompleted
//     ];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   }
// };

// module.exports = Roadmap;