// controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');

exports.getDeveloperRecommendations = async (req, res) => {
  const developerId = req.user.id;

  try {
    const recommendations = await recommendationService.getRecommendations(developerId);
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};
