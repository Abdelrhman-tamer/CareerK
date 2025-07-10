const recommendationService = require('../../services/recommendations');

const getRecommendations = async (req, res) => {
  try {
    const developerId = req.user.id; // Set by authenticateUser middleware

    const recommendations = await recommendationService.getRecommendationsForDeveloper(developerId);
    console.log("📄 Developer CV Text:", developerCvText.slice(0, 500)); // log only first 500 chars

    res.status(200).json({
      success: true,
      message: 'Recommended jobs and services fetched successfully.',
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations.',
    });
  }
};

module.exports = {
  getRecommendations,
};
