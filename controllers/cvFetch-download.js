const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

exports.downloadCvByContext = async (req, res) => {
  const { type, id, subtype } = req.query;

  let filePath = null;
  let developerId = null;

  try {
    if (type === 'job_application') {
      const { rows } = await pool.query(
        `SELECT uploaded_cv, developer_id FROM job_applications WHERE id = $1`,
        [id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: 'Job application not found' });

      filePath = rows[0].uploaded_cv;
      developerId = rows[0].developer_id;

    } else if (type === 'service_application') {
      const { rows } = await pool.query(
        `SELECT uploaded_cv, developer_id FROM service_applications WHERE id = $1`,
        [id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: 'Service application not found' });

      filePath = rows[0].uploaded_cv;
      developerId = rows[0].developer_id;

    } else if (type === 'developer') {
      developerId = id;

      if (subtype === 'uploaded') {
        const devRes = await pool.query(
          `SELECT uploaded_cv FROM developers WHERE id = $1`,
          [developerId]
        );
        if (devRes.rows.length > 0) {
          filePath = devRes.rows[0].uploaded_cv;
        }

      } else if (subtype === 'generated') {
        const genRes = await pool.query(
          `SELECT file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [developerId]
        );
        if (genRes.rows.length > 0) {
          filePath = genRes.rows[0].file_path;
        }

      } else {
        // Fallback if subtype is not specified
        const devRes = await pool.query(
          `SELECT uploaded_cv FROM developers WHERE id = $1`,
          [developerId]
        );
        if (devRes.rows.length > 0 && devRes.rows[0].uploaded_cv) {
          filePath = devRes.rows[0].uploaded_cv;
        }

        if (!filePath) {
          const genRes = await pool.query(
            `SELECT file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [developerId]
          );
          if (genRes.rows.length > 0) {
            filePath = genRes.rows[0].file_path;
          }
        }
      }

    } else {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    if (!filePath) {
      return res.status(404).json({ message: 'CV file not found' });
    }

    const cleanedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.resolve(__dirname, '../', cleanedPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'CV file missing on server' });
    }

    return res.download(fullPath);

  } catch (error) {
    console.error('Error downloading CV:', error);
    return res.status(500).json({ message: 'Failed to download CV' });
  }
};









// const path = require('path');
// const fs = require('fs');
// const { getDeveloperCvPaths } = require('../services/cvFetch-download');

// exports.downloadDeveloperCv = async (req, res) => {
//   const developerId = req.user.id; // ✅ FIXED

//   try {
//     const { uploaded_cv, generated_cv } = await getDeveloperCvPaths(developerId);

//     const filePath = uploaded_cv || generated_cv;

//     if (!filePath) {
//       return res.status(404).json({ message: 'Developer has no usable CV' });
//     }

//     // ✅ If filePath already includes "uploads/cvs/", don't re-append it
//     const fullPath = path.resolve(__dirname, '../', filePath); // ✅ FIXED

//     if (!fs.existsSync(fullPath)) {
//       return res.status(404).json({ message: 'CV file not found on server' });
//     }

//     return res.download(fullPath);
//   } catch (error) {
//     console.error('Error downloading CV:', error);
//     return res.status(500).json({ message: 'Failed to download CV' });
//   }
// };
