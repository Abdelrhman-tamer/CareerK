// #!/usr/bin/env node
// require('dotenv').config();
// const fs = require('fs').promises;
// const path = require('path');
// const { Pool } = require('pg');

// // Database connection
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

// // Path to your JSON files
// const ROADMAPS_DIR = path.join(__dirname, '../roadmaps_files/tracks.json');

// async function loadRoadmaps() {
//   try {
//     const files = await fs.readdir(ROADMAPS_DIR);
//     let loadedCount = 0;

//     for (const file of files) {
//       if (file.endsWith('.json')) {
//         const filePath = path.join(ROADMAPS_DIR, file);
//         const data = await fs.readFile(filePath, 'utf8');
//         const roadmap = JSON.parse(data);

//         // Insert into database
//         await pool.query(
//           `INSERT INTO roadmaps (
//             title, slug, type, description,
//             difficulty_level, estimated_duration, 
//             is_public, steps
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//           ON CONFLICT (slug) DO NOTHING`, // Skip if already exists
//           [
//             roadmap.title,
//             roadmap.slug,
//             'standard', // Always standard for these
//             roadmap.description,
//             roadmap.difficulty_level || 'beginner',
//             roadmap.estimated_duration || 0,
//             roadmap.is_public !== false, // Default to true
//             roadmap.steps
//           ]
//         );

//         loadedCount++;
//         console.log(`Loaded: ${roadmap.title}`);
//       }
//     }

//     console.log(`\nSuccess! Loaded ${loadedCount} standard roadmaps.`);
//     process.exit(0);
//   } catch (error) {
//     console.error('Error loading roadmaps:', error);
//     process.exit(1);
//   }
// }

// // Run the script
// loadRoadmaps();