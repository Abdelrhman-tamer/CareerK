const { pool } = require('../../config/db');



// ✅ Get all completed steps for a specific roadmap and developer
exports.getCompletedSteps = async (roadmapId, developerId) => {
  const client = await pool.connect();
  try {
    const stepQuery = `
      SELECT rp.step_id
      FROM developer_roadmap_progress rp
      JOIN roadmap_steps rs ON rp.step_id = rs.id
      JOIN roadmap_sections s ON rs.section_id = s.id
      WHERE s.roadmap_id = $1
        AND rp.developer_id = $2
        AND rp.is_completed = true
    `;
    const result = await client.query(stepQuery, [roadmapId, developerId]);
    return result.rows.map(row => row.step_id);
  } catch (err) {
    console.error('❌ Error in getCompletedSteps:', err);
    throw new Error('Failed to get completed roadmap steps');
  } finally {
    client.release();
  }
};

// ✅ Mark or unmark a step as completed for a developer
exports.setStepCompletion = async (developerId, stepId, isCompleted = true) => {
  const client = await pool.connect();
  try {
    const insertQuery = `
      INSERT INTO developer_roadmap_progress (developer_id, step_id, is_completed)
      VALUES ($1, $2, $3)
      ON CONFLICT (developer_id, step_id)
      DO UPDATE SET is_completed = $3, updated_at = CURRENT_TIMESTAMP
    `;
    await client.query(insertQuery, [developerId, stepId, isCompleted]);
  } catch (err) {
    console.error('❌ Error in setStepCompletion:', err);
    throw new Error('Failed to set step completion');
  } finally {
    client.release();
  }
};
