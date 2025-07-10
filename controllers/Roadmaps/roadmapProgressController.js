const roadmapProgressService = require('../../services/Roadmaps/roadmapProgressService');



// ✅ Get all completed step_ids for a roadmap
exports.getProgressByRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const developerId = req.user.id;

    if (!roadmapId || !developerId) {
      return res.status(400).json({ message: 'Missing roadmap ID or developer ID' });
    }

    const progress = await roadmapProgressService.getCompletedSteps(roadmapId, developerId);
    res.status(200).json({ completedStepIds: progress });
    
  } catch (error) {
    console.error('❌ Error in getProgressByRoadmap:', error);
    
    // Handle specific error cases
    if (error.message === 'Roadmap not found') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

// // ✅ Get all completed step_ids for a roadmap (uses req.user.id)
// exports.getProgressByRoadmap = async (req, res) => {
//   try {
//     const { roadmapId } = req.params;
//     const developerId = req.user.id; // 🔐 Extracted from token

//     if (!roadmapId || !developerId) {
//       return res.status(400).json({ message: 'Missing roadmap ID or developer ID' });
//     }

//     const progress = await roadmapProgressService.getCompletedSteps(roadmapId, developerId);
//     res.status(200).json({ completedStepIds: progress });
//   } catch (error) {
//     console.error('❌ Error in getProgressByRoadmap:', error);
//     res.status(500).json({ message: 'Failed to fetch progress' });
//   }
// };

// ✅ Mark or unmark a step as completed (uses req.user.id)
exports.markStepCompletion = async (req, res) => {
  try {
    const developerId = req.user.id; // 🔐 Authenticated user
    const { stepId, isCompleted } = req.body;

    if (!stepId) {
      return res.status(400).json({ message: 'Step ID is required' });
    }

    await roadmapProgressService.setStepCompletion(developerId, stepId, isCompleted);
    res.status(200).json({ message: 'Step progress updated' });
  } catch (error) {
    console.error('❌ Error in markStepCompletion:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};
