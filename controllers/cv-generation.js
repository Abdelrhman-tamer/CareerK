const cvService = require("../services/cv-generation/cvService");

// 1️⃣ Start a new CV session
exports.startSession = async (req, res) => {
    const type = req.body.type || "form";
    const developerId = req.user.id;

    try {
        const session = await cvService.createSession(developerId, type);
        res.status(201).json({ sessionId: session.id });
    } catch (err) {
        console.error("❌ Failed to start CV session:", err.message);
        res.status(500).json({
            message: "Failed to start session",
            error: err.message,
        });
    }
};

// 2️⃣ Submit full CV data (form mode)
exports.updateData = async (req, res) => {
    const { sessionId } = req.params;
    const formData = req.body;
    const replace = req.query.replace === "true"; // use ?replace=true to wipe old data

    try {
        await cvService.updateFullData(sessionId, formData, replace);
        res.status(200).json({ message: "CV data submitted successfully" });
    } catch (err) {
        console.error("❌ Failed to submit CV data:", err.message);
        res.status(500).json({
            message: "Failed to submit data",
            error: err.message,
        });
    }
};

exports.getCurrentSession = async (req, res) => {
    try {
        const developerId = req.user.id;
        const sessionId = await cvService.getCurrentSessionId(developerId);

        if (!sessionId) {
            return res.status(404).json({ error: "No session found" });
        }

        const sessionData = await cvService.getSessionData(
            sessionId,
            developerId
        );
        res.json(sessionData);
    } catch (err) {
        console.error("❌ Failed to get current session:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 3️⃣ Get session data (for current user or admin)
exports.getSessionData = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const developerId = req.user.id; // from auth middleware
        const sessionData = await cvService.getSessionData(
            sessionId,
            developerId
        );
        res.json(sessionData);
    } catch (err) {
        console.error("❌ Failed to fetch session data:", err.message);
        res.status(403).json({ error: err.message });
    }
};

// 🔹 Get latest session data for current developer
exports.getActiveSession = async (req, res) => {
    try {
        const developerId = req.user.id;
        const sessionId = await cvService.getLatestSessionId(developerId);

        if (!sessionId) {
            return res.status(404).json({ error: "No active session found" });
        }

        const sessionData = await cvService.getSessionData(
            sessionId,
            developerId
        );
        res.json(sessionData);
    } catch (err) {
        console.error("❌ Error fetching active session:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 4️⃣ Generate and store CV
exports.generateCV = async (req, res) => {
    const { sessionId } = req.params;
    const developerId = req.user.id;

    try {
        const cvPath = await cvService.generateAndStoreCV(
            sessionId,
            developerId
        );
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";
        const relativePath = cvPath.replace(/^\/?/, "").replace(/\\/g, "/");
        const fullDownloadUrl = `${baseUrl}/${relativePath}`;
        res.status(200).json({
            message: "CV generated successfully",
            downloadUrl: fullDownloadUrl,
        });
    } catch (err) {
        console.error("❌ Failed to generate CV:", err.message);
        res.status(500).json({
            message: "Failed to generate CV",
            error: err.message,
        });
    }
};

// exports.regenerateCV = async (req, res) => {
//     const { sessionId } = req.params;
//     const developerId = req.user.id;

//     try {
//         const cvPath = await cvService.regenerateCV(sessionId, developerId);
//         const baseUrl = process.env.BASE_URL || "http://localhost:3000";
//         const relativePath = cvPath.replace(/^\/?/, "").replace(/\\/g, "/");
//         const fullDownloadUrl = `${baseUrl}/${relativePath}`;

//         res.status(200).json({
//             message: "CV regenerated successfully",
//             downloadUrl: fullDownloadUrl,
//         });
//     } catch (err) {
//         console.error("❌ Failed to regenerate CV:", err.message);
//         res.status(500).json({
//             message: "Failed to regenerate CV",
//             error: err.message,
//         });
//     }
// };
