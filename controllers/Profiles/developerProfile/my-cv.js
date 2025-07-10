const { pool } = require("../../../config/db");
const fs = require("fs");
const path = require("path");
const BASE_URL = process.env.BASE_URL;

exports.getDeveloperCVs = async (req, res) => {
    const developerId = req.user.id;

    try {
        const devResult = await pool.query(
            `SELECT uploaded_cv FROM developers WHERE id = $1`,
            [developerId]
        );
        if (devResult.rowCount === 0) {
            return res.status(404).json({ message: "Developer not found" });
        }

        const uploadedCV = devResult.rows[0].uploaded_cv;
        let uploadedCVUrl = null;
        if (uploadedCV) {
            // Check if the path already includes 'uploads' (to avoid duplication)
            const basePath = uploadedCV.startsWith("uploads/")
                ? ""
                : "uploads/cvs/";
            uploadedCVUrl = `${BASE_URL}/${basePath}${uploadedCV.replace(
                /^\/?/,
                ""
            )}`;
        }
        // const uploadedCVUrl = uploadedCV ? `${BASE_URL}/${uploadedCV}` : null;

        const genResult = await pool.query(
            `SELECT file_path FROM generated_cvs 
       WHERE developer_id = $1 AND active = TRUE
       ORDER BY created_at DESC LIMIT 1`,
            [developerId]
        );
        let generatedCV = genResult.rows[0]?.file_path || null;
        if (generatedCV && !generatedCV.startsWith("http")) {
            generatedCV = `${BASE_URL}/${generatedCV.replace(/^\/?/, "")}`;
        }

        res.json({ uploaded_cv: uploadedCVUrl, generated_cv: generatedCV });
    } catch (err) {
        console.error("❌ Error fetching CVs:", err.message);
        res.status(500).json({
            message: "Failed to get CVs",
            error: err.message,
        });
    }
};

exports.updateDeveloperCV = async (req, res) => {
    const developerId = req.user.id;

    try {
        if (req.file) {
            const uploadedPath = `uploads/cvs/${req.file.filename}`;
            await pool.query(
                `UPDATE developers SET uploaded_cv = $1 WHERE id = $2`,
                [uploadedPath, developerId]
            );
            console.log(`✅ Uploaded CV saved: ${uploadedPath}`);
            return res.json({
                message: "Uploaded CV updated",
                uploaded_cv: `${BASE_URL}/${uploadedPath}`,
            });
        } else if (req.body.type === "generated" && req.body.file_path) {
            const sessionId = req.body.session_id || null;
            const filePath = req.body.file_path;
            await pool.query(
                `INSERT INTO generated_cvs (developer_id, session_id, file_path) VALUES ($1, $2, $3)`,
                [developerId, sessionId, filePath]
            );
            console.log(`✅ Generated CV registered: ${filePath}`);
            return res.json({
                message: "Generated CV registered",
                generated_cv: filePath,
            });
        }

        res.status(400).json({ message: "No valid input provided" });
    } catch (err) {
        console.error("❌ Failed to update CV:", err.message);
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

exports.deleteDeveloperCV = async (req, res) => {
    const developerId = req.user.id;
    const { type } = req.body;

    try {
        const devResult = await pool.query(
            `SELECT uploaded_cv FROM developers WHERE id = $1`,
            [developerId]
        );
        const uploadedCV = devResult.rows[0]?.uploaded_cv;
        let deleted = [];

        // 🔴 Delete uploaded CV
        if (type === "uploaded" || type === "both") {
            if (uploadedCV) {
                const fullPath = path.join(__dirname, "../../..", uploadedCV);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`🗑️ Deleted uploaded CV: ${fullPath}`);
                }
                await pool.query(
                    `UPDATE developers SET uploaded_cv = NULL WHERE id = $1`,
                    [developerId]
                );
                deleted.push("uploaded");
            }
        }

        // 🔴 Delete generated CV
        if (type === "generated" || type === "both") {
            const genResult = await pool.query(
                `SELECT id, file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
                [developerId]
            );

            if (genResult.rowCount > 0) {
                const { id, file_path } = genResult.rows[0];
                const relativePath = file_path.replace(`${BASE_URL}/`, "");
                const fullPath = path.join(__dirname, "../../..", relativePath);

                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`🗑️ Deleted generated CV: ${fullPath}`);
                }

                await pool.query(`DELETE FROM generated_cvs WHERE id = $1`, [
                    id,
                ]);
                deleted.push("generated");
            }
        }

        if (deleted.length === 0) {
            return res.status(404).json({ message: "No CVs found to delete" });
        }

        res.json({ message: `${deleted.join(" & ")} CV(s) deleted` });
    } catch (err) {
        console.error("❌ Failed to delete CV:", err.message);
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};

// exports.getDeveloperCVs = async (req, res) => {
//   const developerId = req.user.id;

//   try {
//     const devResult = await pool.query(`SELECT uploaded_cv FROM developers WHERE id = $1`, [developerId]);
//     if (devResult.rowCount === 0) return res.status(404).json({ message: 'Developer not found' });

//     const uploadedCV = devResult.rows[0].uploaded_cv;

//     const genResult = await pool.query(`
//       SELECT file_path FROM generated_cvs
//       WHERE developer_id = $1
//       ORDER BY created_at DESC LIMIT 1
//     `, [developerId]);

//     const generatedCV = genResult.rows[0]?.file_path || null;

//     res.json({
//       uploaded_cv: uploadedCV ? `${BASE_URL}/${uploadedCV}` : null,
//       generated_cv: generatedCV,
//     });

//   } catch (err) {
//     console.error('❌ Error fetching CVs:', err.message);
//     res.status(500).json({ message: 'Failed to get CVs', error: err.message });
//   }
// };

// exports.updateDeveloperCV = async (req, res) => {
//   const developerId = req.user.id;

//   try {
//     if (req.file) {
//       // Uploaded CV
//       const uploadedPath = `uploads/cvs/${req.file.filename}`;
//       await pool.query(`UPDATE developers SET uploaded_cv = $1 WHERE id = $2`, [uploadedPath, developerId]);
//       return res.json({ message: 'Uploaded CV updated', uploaded_cv: `${BASE_URL}/${uploadedPath}` });
//     } else if (req.body.type === 'generated' && req.body.file_path) {
//       // OPTIONAL: manually register new generated CV from frontend
//       const sessionId = req.body.session_id || null;
//       const filePath = req.body.file_path;

//       await pool.query(`
//         INSERT INTO generated_cvs (developer_id, session_id, file_path)
//         VALUES ($1, $2, $3)
//       `, [developerId, sessionId, filePath]);

//       return res.json({ message: 'Generated CV registered', generated_cv: filePath });
//     }

//     res.status(400).json({ message: 'No valid input provided' });
//   } catch (err) {
//     console.error('❌ Failed to update CV:', err.message);
//     res.status(500).json({ message: 'Update failed', error: err.message });
//   }
// };

// exports.deleteDeveloperCV = async (req, res) => {
//   const developerId = req.user.id;
//   const { type } = req.body;

//   try {
//     const devResult = await pool.query(`SELECT uploaded_cv FROM developers WHERE id = $1`, [developerId]);
//     const uploadedCV = devResult.rows[0]?.uploaded_cv;

//     let deleted = [];

//     // 🔴 Delete uploaded
//     if (type === 'uploaded' || type === 'both') {
//       if (uploadedCV) {
//         const filePath = path.join(__dirname, '..', uploadedCV);
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//         await pool.query(`UPDATE developers SET uploaded_cv = NULL WHERE id = $1`, [developerId]);
//         deleted.push('uploaded');
//       }
//     }

//     // 🔴 Delete generated
//     if (type === 'generated' || type === 'both') {
//       const genResult = await pool.query(`
//         SELECT id, file_path FROM generated_cvs
//         WHERE developer_id = $1
//         ORDER BY created_at DESC LIMIT 1
//       `, [developerId]);

//       if (genResult.rowCount > 0) {
//         const { id, file_path } = genResult.rows[0];
//         const filePath = path.join(__dirname, '..', file_path.replace(`${BASE_URL}/`, ''));

//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//         await pool.query(`DELETE FROM generated_cvs WHERE id = $1`, [id]);
//         deleted.push('generated');
//       }
//     }

//     if (deleted.length === 0) return res.status(404).json({ message: 'No CVs found to delete' });

//     res.json({ message: `${deleted.join(' & ')} CV(s) deleted` });

//   } catch (err) {
//     console.error('❌ Failed to delete CV:', err.message);
//     res.status(500).json({ message: 'Delete failed', error: err.message });
//   }
// };
