const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const path = require('path'); 
const fs = require('fs');
// const tracks = require('../roadmaps_files/tracks.json');

const getTracks = (req, res) => {
  const tracksPath = path.join(__dirname,'../roadmaps_files', 'tracks.json');

  try {
    const data = fs.readFileSync(tracksPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: 'Error reading tracks.json' });
  }
};

const getStandardRoadmap = (req, res) => {
  const { slug } = req.params;
  const roadmapPath = path.join(__dirname, '../roadmaps_files/roadmaps', `${slug}.json`);

  if (!fs.existsSync(roadmapPath)) {
    return res.status(404).json({ message: 'Roadmap not found' });
  }

  try {
    const data = fs.readFileSync(roadmapPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: 'Error reading roadmap file' });
  }
};

module.exports = {
  getTracks,
  getStandardRoadmap
};

  
// Get all AI-generated roadmaps (public)
const getAIRoadmaps = async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM roadmaps WHERE type = 'ai' AND is_public = true"
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching AI roadmaps:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get developer-specific AI-generated roadmaps
  const getDeveloperRoadmaps = async (req, res) => {
    const developerId = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM roadmaps WHERE type = 'ai' AND created_by = $1",
        [developerId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching developer roadmaps:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Create new AI roadmap
  const createAIRoadmap = async (req, res) => {
    const {
      title, slug, description, difficulty_level,
      estimated_duration, track_id, steps, created_by
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO roadmaps 
          (title, slug, description, type, difficulty_level, estimated_duration, track_id, steps, created_by)
         VALUES 
          ($1, $2, $3, 'ai', $4, $5, $6, $7, $8)
         RETURNING *`,
        [title, slug, description, difficulty_level, estimated_duration, track_id, steps, created_by]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating roadmap:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  module.exports = {getStandardRoadmap, getAIRoadmaps, getDeveloperRoadmaps, createAIRoadmap};








// const Roadmap = require('../models/roadmap');
// const fs = require('fs').promises;
// const path = require('path');


// exports.loadStandardRoadmaps = async (req, res) => {
//   try {
//     // Path to your JSON files directory
//     const roadmapsDir = path.join(__dirname, '../../data/standard-roadmaps');
//     const files = await fs.readdir(roadmapsDir);
    
//     const loadedRoadmaps = [];
    
//     for (const file of files) {
//       if (file.endsWith('.json')) {
//         const filePath = path.join(roadmapsDir, file);
//         const data = await fs.readFile(filePath, 'utf8');
//         const roadmapData = JSON.parse(data);
        
//         // Add standard roadmap to database
//         const roadmap = await Roadmap.create({
//           ...roadmapData,
//           type: 'standard',
//           created_by: null // Or set to a system user ID
//         });
        
//         loadedRoadmaps.push(roadmap);
//       }
//     }
    
//     res.json({
//       message: `${loadedRoadmaps.length} standard roadmaps loaded`,
//       roadmaps: loadedRoadmaps
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to load standard roadmaps',
//       details: error.message 
//     });
//   }
// };

// exports.getStandardRoadmaps = async (req, res) => {
//   try {
//     const roadmaps = await Roadmap.findAllByType('standard');
//     res.json(roadmaps);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.createRoadmap = async (req, res) => {
//   try {
//     const { 
//       title, 
//       slug, 
//       type, 
//       track_id, 
//       description, 
//       difficulty_level, 
//       estimated_duration, 
//       is_public,
//       steps 
//     } = req.body;

//     // Validate roadmap type
//     if (!['standard', 'ai', 'community'].includes(type)) {
//       return res.status(400).json({ error: 'Invalid roadmap type' });
//     }

//     // For AI-generated roadmaps, ensure they have the correct type
//     if (req.isAIRoadmap && type !== 'ai') {
//       return res.status(400).json({ error: 'AI-generated roadmaps must have type "ai"' });
//     }

//     const roadmap = await Roadmap.create({
//       title,
//       slug,
//       type,
//       track_id: track_id || null,
//       created_by: req.user.id,
//       description,
//       difficulty_level,
//       estimated_duration,
//       is_public: is_public !== false, // default to true
//       steps: Array.isArray(steps) ? steps : []
//     });

//     res.status(201).json(roadmap);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getRoadmap = async (req, res) => {
//   try {
//     const roadmap = await Roadmap.findById(req.params.id);
//     if (!roadmap) {
//       return res.status(404).json({ error: 'Roadmap not found' });
//     }

//     // Check visibility
//     if (!roadmap.is_public && (!req.user || roadmap.created_by !== req.user.id)) {
//       return res.status(403).json({ error: 'Not authorized to access this roadmap' });
//     }

//     res.json(roadmap);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateRoadmap = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Don't allow changing type from standard to ai or vice versa
//     if (updates.type) {
//       const existing = await Roadmap.findById(id);
//       if (existing.type !== updates.type) {
//         return res.status(400).json({ error: 'Cannot change roadmap type' });
//       }
//     }

//     const roadmap = await Roadmap.update(id, updates);
//     res.json(roadmap);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.generateAIRoadmap = async (req, res) => {
//   try {
//     // This would call your AI service
//     const aiRoadmap = await generateRoadmapWithAI(req.body.params);
    
//     // Set the special flag for the create method
//     req.isAIRoadmap = true;
    
//     // Use the standard create method but with AI-specific data
//     req.body = {
//       ...aiRoadmap,
//       type: 'ai',
//       created_by: req.user.id
//     };

//     return exports.createRoadmap(req, res);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getUserProgress = async (req, res) => {
//   try {
//     const progress = await Roadmap.getUserProgress(req.user.id, req.params.roadmapId);
//     res.json(progress || {});
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateUserProgress = async (req, res) => {
//   try {
//     const progress = await Roadmap.updateUserProgress(
//       req.user.id,
//       req.params.roadmapId,
//       req.body.completed_steps,
//       req.body.current_step,
//       req.body.is_completed
//     );
//     res.json(progress);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };