const generateCVFromAI = async (developer) => {
    // This could call your Gemini API
    // Example: format and send data
    const prompt = {
        name: developer.full_name,
        email: developer.email,
        phone: developer.phone_number,
        courses: developer.courses,
        // Add more fields as needed
    };

    // Replace with your actual call
    const aiResponse = await fetch("http://your-gemini-server/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
    });

    const data = await aiResponse.json();
    return data.generated_cv_html;
};

module.exports = { generateCVFromAI };
