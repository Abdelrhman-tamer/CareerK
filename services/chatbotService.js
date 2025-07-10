const model = require("../config/gemini");

exports.askGemini = async (userPrompt) => {
    try {
        const finalPrompt = `
You are an AI career assistant inside a professional career platform.

The user has asked:
"${userPrompt}"

Please respond with a **clear, short, and helpful answer**.

- Avoid listing too many options.
- Do NOT include instructions like "replace this" or "choose one".
- Avoid meta-comments.
- If it’s a resume summary, give a 3–4 line summary only.
- If it’s an interview question request, give 2–3 focused questions.
- If it’s about tools, give a concise explanation.
- Keep your tone professional but friendly.
- Your reply will be shown directly to a user, so make it copy-paste ready if needed.
`;

        const result = await model.generateContent([finalPrompt]);
        const response = await result.response.text();
        return response.trim();
        // return response;
    } catch (err) {
        console.error("Gemini API error:", err);
        return "⚠️ Error processing your request.";
    }
};

// const model = require("../config/gemini");

// exports.askGemini = async (prompt) => {
//     try {
//         const result = await model.generateContent([prompt]);
//         const response = await result.response.text();
//         return response;
//     } catch (err) {
//         console.error("Gemini API error:", err);
//         return "⚠️ Error processing your request.";
//     }
// };
