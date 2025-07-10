const { pool } = require('../../config/db');

exports.getFullRoadmap = async (trackId, level) => {
  const client = await pool.connect();
  try {
    // Step 1: Get roadmap
    const roadmapRes = await client.query(`
      SELECT * FROM roadmaps
      WHERE track_id = $1 AND LOWER(level) = LOWER($2)
      LIMIT 1
    `, [trackId, level]);

    if (roadmapRes.rowCount === 0) return null;

    const roadmap = roadmapRes.rows[0];

    // Step 2: Get sections
    const sectionRes = await client.query(`
      SELECT * FROM roadmap_sections
      WHERE roadmap_id = $1
      ORDER BY section_order ASC
    `, [roadmap.id]);

    const sections = [];

    // Step 3: For each section, fetch steps
    for (const section of sectionRes.rows) {
      const stepRes = await client.query(`
        SELECT id, title, description, resource_link, skills_covered, step_order
        FROM roadmap_steps
        WHERE section_id = $1
        ORDER BY step_order ASC
      `, [section.id]);

      sections.push({
        id: section.id,
        title: section.title,
        section_order: section.section_order,
        steps: stepRes.rows
      });
    }

    // Step 4: Return combined roadmap structure
    return {
      id: roadmap.id,
      track_id: roadmap.track_id,
      level: roadmap.level,
      title: roadmap.title,
      sections: sections
    };
  } catch (err) {
    console.error('Error in getFullRoadmap:', err);
    throw err;
  } finally {
    client.release();
  }
};
