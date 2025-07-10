const { pool } = require("../../config/db");
const aiCvService = require("./aiCvService");

// 🔹 Start a new CV session
exports.createSession = async (developerId, type = "form") => {
    const result = await pool.query(
        `INSERT INTO cv_sessions (developer_id, type) VALUES ($1, $2) RETURNING id`,
        [developerId, type]
    );

    const sessionId = result.rows[0].id;

    // ✅ Track it in developer's profile
    await pool.query(
        `UPDATE developers SET active_cv_session_id = $1 WHERE id = $2`,
        [sessionId, developerId]
    );

    return result.rows[0];
};

// exports.createSession = async (developerId, type) => {
//     const result = await pool.query(
//         `INSERT INTO cv_sessions (developer_id, type) VALUES ($1, $2) RETURNING id`,
//         [developerId, type]
//     );
//     return result.rows[0];
// };

// 🔹 Deep merge helper for nested objects (recursive)
const deepMerge = (target = {}, source = {}) => {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            typeof target[key] === "object"
        ) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }
    return output;
};

// 🔹 Store or update full form data (merged or new)
exports.updateFullData = async (sessionId, formData, replace = false) => {
    if (!sessionId || !formData || typeof formData !== "object") {
        throw new Error(
            `Invalid inputs for update: sessionId=${sessionId}, data=${JSON.stringify(
                formData
            )}`
        );
    }

    try {
        let finalData = formData;

        if (!replace) {
            const existing = await pool.query(
                `SELECT data FROM cv_data WHERE session_id = $1`,
                [sessionId]
            );

            if (existing.rows.length > 0) {
                const existingData = existing.rows[0].data;
                finalData = deepMerge(existingData, formData);
            }
        }

        await pool.query(
            `INSERT INTO cv_data (session_id, data)
             VALUES ($1, $2::jsonb)
             ON CONFLICT (session_id)
             DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
            [sessionId, JSON.stringify(finalData)]
        );
    } catch (err) {
        console.error("❌ Failed to save CV form data:", err.message);
        throw new Error("Failed to update CV data: " + err.message);
    }
};
// exports.updateFullData = async (sessionId, formData, replace = false) => {
//     if (!sessionId || !formData || typeof formData !== "object") {
//         throw new Error(
//             `Invalid inputs for update: sessionId=${sessionId}, data=${JSON.stringify(
//                 formData
//             )}`
//         );
//     }

//     try {
//         let finalData = formData;

//         if (!replace) {
//             const existing = await pool.query(
//                 `SELECT data FROM cv_data WHERE session_id = $1`,
//                 [sessionId]
//             );

//             if (existing.rows.length > 0) {
//                 const existingData = existing.rows[0].data;
//                 finalData = {
//                     ...existingData,
//                     ...formData,
//                     personal_info: {
//                         ...existingData.personal_info,
//                         ...formData.personal_info,
//                     },
//                 };
//             }
//         }

//         await pool.query(
//             `INSERT INTO cv_data (session_id, data)
//              VALUES ($1, $2::jsonb)
//              ON CONFLICT (session_id)
//              DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
//             [sessionId, JSON.stringify(finalData)]
//         );
//     } catch (err) {
//         console.error("❌ Failed to save CV form data:", err.message);
//         throw new Error("Failed to update CV data: " + err.message);
//     }
// };

exports.getCurrentSessionId = async (developerId) => {
    const result = await pool.query(
        `SELECT active_cv_session_id FROM developers WHERE id = $1`,
        [developerId]
    );

    if (!result.rowCount || !result.rows[0].active_cv_session_id) {
        return null;
    }

    return result.rows[0].active_cv_session_id;
};

// 🔹 Fetch CV data for a given session (with optional ownership check)
exports.getSessionData = async (sessionId, developerId) => {
    if (!sessionId) {
        throw new Error("Session ID is required");
    }
    if (!developerId) {
        throw new Error("Developer ID is required");
    }

    // ✅ Step 1: Fetch session and check ownership
    const sessionRes = await pool.query(
        `SELECT developer_id, status, created_at, updated_at
         FROM cv_sessions WHERE id = $1`,
        [sessionId]
    );

    if (!sessionRes.rowCount) {
        throw new Error("Session not found");
    }

    const session = sessionRes.rows[0];

    if (session.developer_id !== developerId) {
        throw new Error(
            "Access denied: session does not belong to this developer"
        );
    }

    // ✅ Step 2: Get CV data
    const dataRes = await pool.query(
        `SELECT data FROM cv_data WHERE session_id = $1`,
        [sessionId]
    );

    const cvData = dataRes.rows.length > 0 ? dataRes.rows[0].data : {};

    // ✅ Step 3: Return consistent full response
    return {
        session_id: sessionId,
        developer_id: session.developer_id,
        type: "form", // always fixed
        status: session.status,
        created_at: session.created_at,
        updated_at: session.updated_at,
        data: cvData,
    };
};

// 🔹 Get latest (most recent) non-completed CV session and its data
exports.getLatestSessionId = async (developerId) => {
    const res = await pool.query(
        `
        SELECT cs.id
        FROM cv_sessions cs
        JOIN cv_data cd ON cs.id = cd.session_id
        WHERE cs.developer_id = $1
        ORDER BY cs.updated_at DESC
        LIMIT 1
        `,
        [developerId]
    );

    return res.rowCount > 0 ? res.rows[0].id : null;
};

// 🔹 Generate and save CV
exports.generateAndStoreCV = async (sessionId, developerId) => {
    // ✅ Check session ownership
    const sess = await pool.query(
        `SELECT developer_id FROM cv_sessions WHERE id = $1`,
        [sessionId]
    );
    if (!sess.rowCount || sess.rows[0].developer_id !== developerId) {
        throw new Error("Session does not belong to developer");
    }

    const dataRes = await pool.query(
        `SELECT data FROM cv_data WHERE session_id = $1`,
        [sessionId]
    );
    if (!dataRes.rowCount) {
        throw new Error("No CV data found");
    }

    const pdfPath = await aiCvService.generatePDF(dataRes.rows[0].data);

    // ✅ Deactivate existing generated CVs
    await pool.query(
        `UPDATE generated_cvs SET active = FALSE WHERE developer_id = $1`,
        [developerId]
    );
    await pool.query(
        `INSERT INTO generated_cvs (developer_id, session_id, file_path, active)
       VALUES ($1, $2, $3, TRUE)`,
        [developerId, sessionId, pdfPath]
    );
    await pool.query(
        `UPDATE cv_sessions SET status = 'completed', updated_at = NOW() WHERE id = $1`,
        [sessionId]
    );

    return pdfPath;
};

// exports.regenerateCV = async (sessionId, developerId) => {
//     const sess = await pool.query(
//         `SELECT developer_id FROM cv_sessions WHERE id = $1`,
//         [sessionId]
//     );
//     if (!sess.rowCount || sess.rows[0].developer_id !== developerId) {
//         throw new Error("Session does not belong to developer");
//     }

//     const dataRes = await pool.query(
//         `SELECT data FROM cv_data WHERE session_id = $1`,
//         [sessionId]
//     );
//     if (!dataRes.rowCount) {
//         throw new Error("No CV data found");
//     }

//     const pdfPath = await aiCvService.generatePDF(dataRes.rows[0].data);

//     await pool.query(
//         `UPDATE generated_cvs SET active = FALSE WHERE developer_id = $1`,
//         [developerId]
//     );

//     await pool.query(
//         `INSERT INTO generated_cvs (developer_id, session_id, file_path, active)
//          VALUES ($1, $2, $3, TRUE)`,
//         [developerId, sessionId, pdfPath]
//     );

//     await pool.query(
//         `UPDATE cv_sessions SET status = 'completed', updated_at = NOW() WHERE id = $1`,
//         [sessionId]
//     );

//     return pdfPath;
// };
