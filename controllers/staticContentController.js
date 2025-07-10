const fs = require('fs');
const path = require('path');

// Utility to read JSON file
const readJSON = (folder, file) => {
  const filePath = path.join(__dirname, '..', 'roadmaps_files', folder, `${file}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// GET all tracks (read all JSON files in tracks/)
const getAllTracks = (req, res) => {
  const folderPath = path.join(__dirname, '../roadmaps_files/tracks');
  const files = fs.readdirSync(folderPath);
  const tracks = files.map(file => {
    const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
    return JSON.parse(content);
  });
  res.json(tracks);
};

// GET a single track
const getTrackBySlug = (req, res) => {
  const { slug } = req.params;
  const data = readJSON('tracks', slug);
  if (!data) {
    return res.status(404).json({ message: 'Track not found' });
  }
  res.json(data);
};

// GET a single roadmap
const getRoadmapBySlug = (req, res) => {
  const { slug } = req.params;
  const data = readJSON('roadmaps', slug);
  if (!data) {
    return res.status(404).json({ message: 'Roadmap not found' });
  }
  res.json(data);
};

// GET a single course
const getCourseById = (req, res) => {
  const { id } = req.params;
  const data = readJSON('courses', id);
  if (!data) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(data);
};

module.exports = {
  getAllTracks,
  getTrackBySlug,
  getRoadmapBySlug,
  getCourseById
};
