const axios = require('axios');

const sendToAIModel = async (data) => {
  try {
    
    const response = await axios.post('http://127.0.0.1:8000/recommend', data, {
      timeout: 100000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer <OPTIONAL_AI_API_KEY>'
      }
    });
    console.log('AI Model Response Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending data to AI model:', error.message);
    return null;
  }
};

module.exports = sendToAIModel;
