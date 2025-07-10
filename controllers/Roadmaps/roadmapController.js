const roadmapService = require('../../services/Roadmaps/roadmapService');

exports.getRoadmapByTrackAndLevel = async (req, res) => {
  try {
    const { trackId, level } = req.params;

    if (!trackId || !level) {
      return res.status(400).json({ message: 'trackId and level are required' });
    }

    const roadmap = await roadmapService.getFullRoadmap(trackId, level);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for this track and level' });
    }

    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error in getRoadmapByTrackAndLevel:', error);
    res.status(500).json({ message: 'Server error while fetching roadmap' });
  }
};
