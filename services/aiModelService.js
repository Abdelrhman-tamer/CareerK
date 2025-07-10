// services/aiModelService.js

const axios = require("axios");

const sendAnswersToAI = async (answers) => {
  try {
    const response = await axios.post("http://<AI_MODEL_HOST>:<PORT>/generate-cv", {
      data: answers,
    });

    return response.data; // Expected: { cv: "Generated CV content" }
  } catch (error) {
    console.error("Error calling AI model:", error.message);
    throw new Error("Failed to generate CV from AI model.");
  }
};

module.exports = { sendAnswersToAI };
