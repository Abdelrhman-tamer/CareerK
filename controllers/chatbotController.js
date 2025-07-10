const { askGemini } = require("../services/chatbotService");
const { pool } = require("../config/db");

exports.ask = async (req, res) => {
    const { prompt, session_id } = req.body;
    const user_id = req.user?.id; // from your CareerK auth middleware

    if (!prompt || !user_id) {
        return res.status(400).json({ message: "Prompt and user ID required" });
    }

    try {
        const response = await askGemini(prompt);

        // 🔹 Save to chatbot_messages
        await pool.query(
            `INSERT INTO chatbot_messages (user_id, session_id, prompt, response)
       VALUES ($1, $2, $3, $4)`,
            [user_id, session_id || null, prompt, response]
        );

        res.json({ response });
    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// const { askGemini } = require("../services/chatbotService");

// exports.ask = async (req, res) => {
//     const { prompt } = req.body;

//     if (!prompt) {
//         return res.status(400).json({ message: "Prompt is required" });
//     }

//     try {
//         const reply = await askGemini(prompt);
//         res.json({ response: reply });
//     } catch (error) {
//         console.error("Chatbot error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

exports.getHistory = async (req, res) => {
    const user_id = req.user?.id;
    const { session_id } = req.query;

    if (!user_id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const result = await pool.query(
            `SELECT prompt, response, created_at
         FROM chatbot_messages
         WHERE user_id = $1
         AND ($2::uuid IS NULL OR session_id = $2::uuid)
         ORDER BY created_at ASC`,
            [user_id, session_id || null]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching chat history:", err);
        res.status(500).json({ message: "Server error" });
    }
};
