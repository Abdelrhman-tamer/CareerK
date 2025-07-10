const { pool } = require("../../config/db"); // PostgreSQL connection

// ✅ Create a new job
const createJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "company") {
            return res
                .status(403)
                .json({ message: "Only companies can post jobs" });
        }

        const company_id = req.user.id;
        const {
            title,
            job_description,
            job_type,
            location,
            salary_range,
            deadline_task,
            skills,
            experience_required,
            company_department,
            job_availability,
        } = req.body;

        if (
            !title ||
            !job_description ||
            !job_type ||
            !location ||
            !salary_range ||
            !deadline_task ||
            !skills ||
            !experience_required ||
            !company_department ||
            !job_availability
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const skillsArray = Array.isArray(skills)
            ? skills
            : skills.split(",").map((s) => s.trim());

        const result = await pool.query(
            `INSERT INTO job_posts 
      (company_id, title, job_description, job_type, location, salary_range, deadline_task, skills, experience_required, company_department, job_availability)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
            [
                company_id,
                title,
                job_description,
                job_type,
                location,
                salary_range,
                deadline_task,
                skillsArray,
                experience_required,
                company_department,
                job_availability,
            ]
        );

        res.status(201).json({
            message: "Job posted successfully",
            job: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Error in createJob:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// const qualificationsArray = Array.isArray(qualifications) ? qualifications : qualifications.split(',').map(q => q.trim());

// ✅ Get all jobs (with filters)
const getAllJobs = async (req, res) => {
    try {
        const { job_type, location, experience_required } = req.query;

        let query = `
      SELECT 
        jp.*, 
        c.company_name 
      FROM job_posts jp
      JOIN companies c ON jp.company_id = c.id
      WHERE 1=1
    `;

        let values = [];
        let index = 1;

        if (job_type) {
            query += ` AND jp.job_type = $${index++}`;
            values.push(job_type);
        }

        if (location) {
            query += ` AND jp.location ILIKE $${index++}`;
            values.push(`%${location}%`);
        }

        if (experience_required) {
            query += ` AND jp.experience_required = $${index++}`;
            values.push(experience_required);
        }

        query += ` ORDER BY jp.created_at DESC`;

        const result = await pool.query(query, values);
        res.status(200).json({ jobs: result.rows });
    } catch (error) {
        console.error("❌ Error in getAllJobs:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// ✅ Get a single job by ID
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `
            SELECT 
                jp.*, 
                c.profile_picture AS company_profile_picture,
                c.company_name,
                c.industry,
                c.city,
                c.country
            FROM job_posts jp
            JOIN companies c ON jp.company_id = c.id
            WHERE jp.id = $1
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        const job = rows[0];

        // Normalize the company_profile_picture
        if (
            job.company_profile_picture &&
            !job.company_profile_picture.startsWith("http")
        ) {
            job.company_profile_picture = `${BASE_URL}/${job.company_profile_picture}`;
        }

        res.json(job);
    } catch (error) {
        console.error("❌ Error in getJobById:", error.message);
        res.status(500).json({ error: "Error fetching job" });
    }
};

// ✅ Update a job post
const updateJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "company") {
            return res
                .status(403)
                .json({ message: "Only companies can update jobs" });
        }

        const { id } = req.params;
        const company_id = req.user.id;

        const job = await pool.query(
            "SELECT company_id FROM job_posts WHERE id = $1",
            [id]
        );
        if (job.rows.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (String(job.rows[0].company_id) !== String(company_id)) {
            return res
                .status(403)
                .json({ message: "Unauthorized to update this job" });
        }

        const {
            title,
            job_description,
            job_type,
            location,
            salary_range,
            deadline_task,
            skills,
            experience_required,
            company_department,
            job_availability,
        } = req.body;

        if (
            !title ||
            !job_description ||
            !job_type ||
            !location ||
            !salary_range ||
            !deadline_task ||
            !skills ||
            !experience_required ||
            !company_department ||
            !job_availability
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const skillsArray = Array.isArray(skills)
            ? skills
            : skills.split(",").map((s) => s.trim());

        const result = await pool.query(
            `UPDATE job_posts 
       SET title = $1, job_description = $2, job_type = $3, location = $4, salary_range = $5, 
           deadline_task = $6, skills = $7, experience_required = $8, 
           company_department = $9, job_availability = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
            [
                title,
                job_description,
                job_type,
                location,
                salary_range,
                deadline_task,
                skillsArray,
                experience_required,
                company_department,
                job_availability,
                id,
            ]
        );

        res.json({ message: "Job updated successfully", job: result.rows[0] });
    } catch (error) {
        console.error("❌ Error in updateJob:", error.message);
        res.status(500).json({ error: "Error updating job" });
    }
};

// ✅ Delete a job post
const deleteJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "company") {
            return res
                .status(403)
                .json({ message: "Only companies can delete jobs" });
        }

        const { id } = req.params;
        const company_id = req.user.id;

        const job = await pool.query(
            "SELECT company_id FROM job_posts WHERE id = $1",
            [id]
        );
        if (
            job.rows.length === 0 ||
            String(job.rows[0].company_id) !== String(company_id)
        ) {
            return res
                .status(403)
                .json({ message: "Unauthorized to delete this job" });
        }

        await pool.query("DELETE FROM job_posts WHERE id = $1", [id]);
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("❌ Error in deleteJob:", error.message);
        res.status(500).json({ error: "Error deleting job" });
    }
};

// ✅ Get most relevant jobs
const getMostRelevantJobs = async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM job_posts ORDER BY experience_required DESC LIMIT 10"
        );
        res.json(rows);
    } catch (error) {
        console.error("❌ Error in getMostRelevantJobs:", error.message);
        res.status(500).json({ error: "Error fetching most relevant jobs" });
    }
};

// ✅ Get recently posted jobs
const getRecentlyPostedJobs = async (req, res) => {
    try {
        const query = `
            SELECT 
                jp.id,
                jp.title,
                jp.location,
                jp.salary_range,
                jp.experience_required,
                jp.created_at,
                jp.skills,
                c.company_name,
                jp.category,
                jp.job_type,
                jp.job_availability
            FROM job_posts jp
            JOIN companies c ON jp.company_id = c.id
            WHERE jp.application_deadline IS NULL OR jp.application_deadline >= CURRENT_DATE
            ORDER BY jp.created_at DESC
            LIMIT 10
        `;

        const { rows } = await pool.query(query);

        res.json(rows);
    } catch (error) {
        console.error("❌ Error in getRecentlyPostedJobs:", error.message);
        res.status(500).json({ error: "Error fetching recently posted jobs" });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMostRelevantJobs,
    getRecentlyPostedJobs,
};

// const createJob = async (req, res) => {
//     try {
//       // Ensure user is authenticated and has a valid company ID
//       if (!req.user || !req.user.id) {
//         return res.status(401).json({ message: 'Unauthorized: Missing company ID' });
//       }

//       const company_id = req.user.id; // Get the company ID from authenticated user
//       const {
//         title,
//         job_type,
//         location,
//         salary_range,
//         experience_required,
//         job_description,
//         responsibilities,
//         qualifications,
//         skills, // Add skills field
//         benefits,
//         application_deadline,
//         company_website
//       } = req.body;

//       const query = `
//         INSERT INTO jobs (title, company_id, job_type, location, salary_range, experience_required, job_description, responsibilities, qualifications, skills, benefits, application_deadline, company_website)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//         RETURNING *;
//       `;
//       const values = [
//         title,
//         company_id, // Now assigned from the authenticated user
//         job_type,
//         location,
//         salary_range,
//         experience_required,
//         job_description,
//         responsibilities,
//         qualifications,
//         skills,
//         benefits,
//         application_deadline,
//         company_website
//       ];

//       const result = await pool.query(query, values);
//       res.status(201).json(result.rows[0]);
//     } catch (error) {
//       console.error('Error creating job:', error);
//       res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
//   };

// const createJob = async (req, res) => {
//   try {
//     const { title, company_id, job_type, location, salary_range, experience_required, job_description, responsibilities, qualifications, benefits, application_deadline, company_website, skills } = req.body;

//     const query = `
//       INSERT INTO jobs (title, company_id, job_type, location, salary_range, experience_required, job_description, responsibilities, qualifications, benefits, application_deadline, company_website, skills)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
//       RETURNING *`;

//     const values = [title, company_id, job_type, location, salary_range, experience_required, job_description, responsibilities, qualifications, benefits, application_deadline, company_website, skills];

//     const { rows } = await pool.query(query, values);
//     res.status(201).json(rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error creating job post' });
//   }
// };
