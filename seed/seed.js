// seed/seed.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:yourpassword@localhost:5432/careerk'
});

const readJSON = (filename) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', filename)));

const insertTrack = async (track) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO tracks (id, name, slug, description, industry, is_featured) VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, track.name, track.slug, track.description, track.industry, track.is_featured || false]
  );
  return id;
};

const insertRoadmap = async (roadmap, trackId) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO roadmaps (id, title, slug, description, type, track_id, difficulty_level, estimated_duration, steps) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, roadmap.title, roadmap.slug, roadmap.description, roadmap.type, trackId, roadmap.difficulty_level, roadmap.estimated_duration, JSON.stringify(roadmap.steps)]
  );
  return id;
};

const insertCourse = async (course, trackId = null, roadmapId = null) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO courses (id, title, slug, description, level, duration, track_id, roadmap_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, course.title, course.slug, course.description, course.level, course.duration, trackId, roadmapId]
  );
  return id;
};

const insertVideo = async (video, courseId) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO course_videos (id, course_id, title, url, duration, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, courseId, video.title, video.url, video.duration, video.sort_order]
  );
};

const insertReview = async (review, courseId) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO course_reviews (id, course_id, reviewer_name, rating, comment) VALUES ($1,$2,$3,$4,$5)`,
    [id, courseId, review.reviewer_name, review.rating, review.comment]
  );
};

const seed = async () => {
  try {
    const tracks = readJSON('tracks.json');
    const roadmaps = readJSON('roadmaps.json');
    const courses = readJSON('courses.json');
    const videos = readJSON('videos.json');
    const reviews = readJSON('reviews.json');

    const trackMap = {};
    const roadmapMap = {};
    const courseMap = {};

    for (const track of tracks) {
      const trackId = await insertTrack(track);
      trackMap[track.slug] = trackId;
    }

    for (const roadmap of roadmaps) {
      const roadmapId = await insertRoadmap(roadmap, trackMap[roadmap.track_slug]);
      roadmapMap[roadmap.slug] = roadmapId;
    }

    for (const course of courses) {
      const trackId = course.track_slug ? trackMap[course.track_slug] : null;
      const roadmapId = course.roadmap_slug ? roadmapMap[course.roadmap_slug] : null;
      const courseId = await insertCourse(course, trackId, roadmapId);
      courseMap[course.slug] = courseId;
    }

    for (const video of videos) {
      await insertVideo(video, courseMap[video.course_slug]);
    }

    for (const review of reviews) {
      await insertReview(review, courseMap[review.course_slug]);
    }

    console.log('✅ Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
