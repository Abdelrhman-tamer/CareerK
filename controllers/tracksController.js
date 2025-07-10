const path = require('path');
const fs = require('fs');

// Get all static tracks from JSON
const getAllTracks = (req, res) => {
  const filePath = path.join(__dirname, '..', 'roadmaps_files', 'tracks.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const tracks = JSON.parse(data);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tracks.json', error: err.message });
  }
};

// Get track by slug
const getTrackBySlug = (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, '..', 'roadmaps_files', 'tracks.json');

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const tracks = JSON.parse(data);
    const track = tracks.find(t => t.slug === slug);

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    res.json(track);
  } catch (err) {
    res.status(500).json({ message: 'Error reading tracks.json', error: err.message });
  }
};

module.exports = {
  getAllTracks,
  getTrackBySlug,
};








// const Track = require('../models/track');

// exports.createTrack = async (req, res) => {
//   try {
//     const { name, slug, description, industry, is_featured } = req.body;
    
//     const track = await Track.create({
//       name,
//       slug,
//       description,
//       industry,
//       is_featured: !!is_featured,
//       created_by: req.user.id
//     });

//     res.status(201).json(track);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTrack = async (req, res) => {
//   try {
//     const track = await Track.findById(req.params.id);
//     if (!track) {
//       return res.status(404).json({ error: 'Track not found' });
//     }
//     res.json(track);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTrackRoadmaps = async (req, res) => {
//   try {
//     const { type } = req.query;
//     const validTypes = ['standard', 'ai', 'community'];
    
//     if (type && !validTypes.includes(type)) {
//       return res.status(400).json({ error: 'Invalid roadmap type' });
//     }

//     const roadmaps = await Track.getRoadmaps(
//       req.params.trackId, 
//       type,
//       req.user?.id // Pass user ID for visibility checks
//     );
//     res.json(roadmaps);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateTrack = async (req, res) => {
//   try {
//     const track = await Track.update(req.params.id, req.body);
//     res.json(track);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };