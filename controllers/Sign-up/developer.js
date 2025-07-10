const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

// Register Developer Controller
const registerDeveloper = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      gender,
      date_of_birth,
      phone_number,
      country,
      city,
      address,
      brief_bio,
      skills = [],
      current_track = null,
      track_level = null,
      previous_job = null,
      type_of_job = null,
      years_of_experience = null,
      expected_salary = null,
      interested_courses = []
    } = req.body;

    const role = "Developer";
    const profile_picture = req.files?.profile_picture?.[0]?.filename || null;
    const uploaded_cv = req.files?.uploaded_cv?.[0]?.filename || null;

    if (!first_name || !last_name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email exists
    const existingUser = await pool.query(
      "SELECT id FROM developers WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Get track_id from current_track (match by name)
    let track_id = null;
    if (current_track) {
      const trackResult = await pool.query(
        `SELECT id FROM tracks WHERE name ILIKE $1`,
        [current_track]
      );
      if (trackResult.rows.length > 0) {
        track_id = trackResult.rows[0].id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const cleanedYearsOfExperience = isNaN(parseInt(years_of_experience)) ? null : parseInt(years_of_experience);
    const cleanedExpectedSalary = isNaN(parseFloat(expected_salary)) ? null : parseFloat(expected_salary);

    const skillsArray = `{${skills.join(",")}}`;
    const interestedCoursesArray = `{${interested_courses.join(",")}}`;

    const insertQuery = `
      INSERT INTO developers 
      (first_name, last_name, email, password, gender, date_of_birth, phone_number, country, city, address,
       brief_bio, skills, current_track, track_level, previous_job, type_of_job,
       years_of_experience, expected_salary, uploaded_cv, interested_courses,
       role, profile_picture, created_at, updated_at, track_id)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, $12, $13, $14, $15, $16,
       $17, $18, $19, $20,
       $21, $22, NOW(), NOW(), $23)
      RETURNING id, first_name, last_name, email, role, profile_picture
    `;

    const insertValues = [
      first_name, last_name, email, hashedPassword, gender, date_of_birth, phone_number,
      country, city, address, brief_bio, skillsArray, current_track, track_level,
      previous_job, type_of_job, cleanedYearsOfExperience, cleanedExpectedSalary,
      uploaded_cv, interestedCoursesArray, role, profile_picture, track_id
    ];

    const { rows } = await pool.query(insertQuery, insertValues);

    return res.status(201).json({
      message: "Developer registered successfully",
      user: rows[0]
    });

  } catch (error) {
    console.error("❌ Error registering developer:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { registerDeveloper };










// const bcrypt = require('bcryptjs');
// const { pool } = require('../config/db');

// const registerDeveloper = async (req, res) => {
//   try {
//     const {
//       first_name,
//       last_name,
//       email,
//       password,
//       confirm_password,
//       gender,
//       date_of_birth,
//       phone_number,
//       country,
//       city,
//       address,
//       brief_bio,
//       skills = [],
//       current_track = null,
//       track_level = null,
//       previous_job = null,
//       type_of_job = null,
//       years_of_experience = null,
//       expected_salary = null,
//       upload_cv = null,
//       interested_courses = [],
//     } = req.body;

//     // Convert empty strings to null for optional number fields
//     const cleaned_years_of_experience = years_of_experience === "" ? null : parseInt(years_of_experience);
//     const cleaned_expected_salary = expected_salary === "" ? null : parseInt(expected_salary);

//     // Define role explicitly
//     const role = "Developer";
    
//     // Get uploaded profile picture
//     const profile_picture = req.file ? req.file.filename : null;

//     // Check if required fields are missing
//     if (!first_name || !last_name || !email || !password || !confirm_password) {
//       return res.status(400).json({ message: "Required fields are missing" });
//     }

//     // Check if passwords match
//     if (password !== confirm_password) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Check if email already exists
//     const existingUser = await pool.query("SELECT * FROM developers WHERE email = $1", [email]);
//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     // Hash password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Convert Arrays to PostgreSQL Format
//     const skillsArray = `{${skills.join(",")}}`;
//     const coursesArray = `{${interested_courses.join(",")}}`;

//     // Insert into database
//     const newDeveloper = await pool.query(
//       `INSERT INTO developers 
//       (first_name, last_name, email, password, gender, date_of_birth, phone_number, country, city, address, brief_bio, skills, current_track, track_level, previous_job, type_of_job, years_of_experience, expected_salary, upload_cv, interested_courses, role, profile_picture)
//       VALUES 
//       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
//       RETURNING id, first_name, last_name, email, role, profile_picture`,
//       [
//         first_name, last_name, email, hashedPassword, gender, date_of_birth, phone_number,
//         country, city, address, brief_bio, skillsArray, current_track, track_level,
//         previous_job, type_of_job, cleaned_years_of_experience, cleaned_expected_salary, upload_cv, coursesArray, role, profile_picture
//       ]
//     );

//     res.status(201).json({
//       message: "Developer registered successfully",
//       user: newDeveloper.rows[0]
//     });

//   } catch (error) {
//     console.error("❌ Error in Developer Registration:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// module.exports = { registerDeveloper };




