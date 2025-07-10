// controllers/jobRecommendationController.js
const axios = require('axios');

exports.recommendJobs = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Call your AI model hosted on another computer
    const aiResponse = await axios.post('http://<AI_SERVER_IP>:<PORT>/generate-job-recommendations', {
      prompt,
    });

    const jobRecommendations = aiResponse.data.jobs; // Depends on AI's response format

    return res.status(200).json({ jobs: jobRecommendations });
  } catch (error) {
    console.error('Error getting job recommendations:', error.message);
    return res.status(500).json({ error: 'Failed to get job recommendations' });
  }
};
