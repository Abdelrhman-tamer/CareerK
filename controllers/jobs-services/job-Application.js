const { pool } = require("../../config/db"); // Import database connection
const BASE_URL = process.env.BASE_URL;

const {
    triggerNotification,
} = require("../../services/notification-system/notificationTrigger");

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const developerId = req.user.id; // Logged-in developer ID
        const { name, phone, years_of_experience, expected_salary } = req.body;
        const email = req.user.email; // Automatically get email from authenticated user

        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "CV file is required" });

        const uploaded_cv = `/uploads/cvs/${file.filename}`;

        // Validate input
        if (
            !name ||
            !email ||
            !phone ||
            !years_of_experience ||
            !expected_salary
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if job exists
        const job = await pool.query(
            "SELECT company_id, title FROM job_posts WHERE id = $1",
            [jobId]
        );
        if (job.rows.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Get the actual job data from the first row
        const jobData = job.rows[0];

        // Check if developer already applied
        const existingApplication = await pool.query(
            "SELECT * FROM job_applications WHERE job_id = $1 AND developer_id = $2",
            [jobId, developerId]
        );
        if (existingApplication.rows.length > 0) {
            return res
                .status(400)
                .json({ message: "You have already applied for this job" });
        }

        // Insert into job_applications table
        await pool.query(
            `INSERT INTO job_applications 
            (id, job_id, developer_id, name, email, phone, years_of_experience, expected_salary, uploaded_cv) 
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                jobId,
                developerId,
                name,
                email,
                phone,
                years_of_experience,
                expected_salary,
                uploaded_cv,
            ]
        );

        // 🔔 Trigger notification to the company
        await triggerNotification({
            recipientId: jobData.company_id,
            recipientType: "company",
            senderId: developerId,
            senderType: "developer",
            title: "New Job Application",
            message: `${name} applied for your job ${jobData.title}`,
            type: "job_application",
        });

        res.status(201).json({
            message: "Job application submitted successfully",
        });
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getJobApplications = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "company") {
            return res
                .status(403)
                .json({ message: "Only companies can view job applications" });
        }

        const { jobId } = req.params;
        const companyId = req.user.id;
        const {
            status,
            sortBy,
            order = "DESC",
            page = 1,
            limit = 10,
        } = req.query;

        // Check job ownership
        const jobCheck = await pool.query(
            "SELECT * FROM job_posts WHERE id = $1 AND company_id = $2",
            [jobId, companyId]
        );

        if (jobCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Job not found or unauthorized" });
        }

        // Pagination
        const offset = (page - 1) * limit;

        // Build query
        let query = `
            SELECT 
                job_applications.id, 
                job_applications.name, 
                job_applications.email, 
                job_applications.phone, 
                job_applications.years_of_experience, 
                job_applications.expected_salary, 
                job_applications.uploaded_cv, 
                job_applications.status, 
                job_applications.created_at, 

                developers.id AS developer_id,
                developers.first_name, 
                developers.last_name,
                developers.profile_picture
            FROM job_applications 
            JOIN developers ON job_applications.developer_id = developers.id 
            WHERE job_applications.job_id = $1
        `;

        const values = [jobId];

        // Optional filter by status
        if (status) {
            query += ` AND job_applications.status = $${values.length + 1}`;
            values.push(status);
        }

        // Sorting
        query += ` ORDER BY job_applications.created_at ${
            sortBy === "date" ? order : "DESC"
        }`;

        // Pagination
        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        // Execute query
        const result = await pool.query(query, values);

        // Format URLs
        const applications = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            yearsOfExperience: row.years_of_experience,
            expectedSalary: row.expected_salary,
            status: row.status,
            createdAt: row.created_at,

            uploadedCv: row.uploaded_cv,
            uploadedCvLink: row.uploaded_cv
                ? `${BASE_URL}/uploads/cvs/${row.uploaded_cv.split("/").pop()}`
                : null,

            developer: {
                id: row.developer_id,
                firstName: row.first_name,
                lastName: row.last_name,
                profilePicture: row.profile_picture
                    ? row.profile_picture.startsWith("http")
                        ? row.profile_picture
                        : `${BASE_URL}/uploads/profile_pictures/${row.profile_picture.replace(
                              /^\/+/,
                              ""
                          )}`
                    : null,
            },
        }));

        res.json({ applications });
    } catch (error) {
        console.error("❌ Error in getJobApplications:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// ✅ Withdraw a job application
const withdrawApplication = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "developer") {
            return res
                .status(403)
                .json({ message: "Only developers can withdraw applications" });
        }

        const developer_id = req.user.id;
        const { application_id } = req.params;

        // Check if the application exists and belongs to the logged-in developer
        const application = await pool.query(
            `SELECT * FROM job_applications WHERE id = $1 AND developer_id = $2`,
            [application_id, developer_id]
        );

        if (application.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found or not yours to delete",
            });
        }

        // Delete the application
        await pool.query(`DELETE FROM job_applications WHERE id = $1`, [
            application_id,
        ]);

        res.json({ message: "Job application withdrawn successfully" });
    } catch (error) {
        console.error("❌ Error in withdrawApplication:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        // 🛑 Auth check
        if (!req.user || req.user.role !== "company") {
            return res.status(403).json({
                message: "Only companies can update job application status",
            });
        }

        const { applicationId } = req.params;
        const { status } = req.body;
        const companyId = req.user.id;

        // ✅ Valid status check
        const validStatuses = ["pending", "accepted", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // 🔎 Check application exists and get job_id + developer_id + job title
        const appQuery = await pool.query(
            `
      SELECT ja.job_id, ja.developer_id, jp.title AS job_title
      FROM job_applications ja
      JOIN job_posts jp ON ja.job_id = jp.id
      WHERE ja.id = $1
      `,
            [applicationId]
        );

        if (appQuery.rows.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        const {
            job_id: jobId,
            developer_id: developerId,
            job_title: jobTitle,
        } = appQuery.rows[0];

        // 🔐 Check job belongs to company
        const jobCheck = await pool.query(
            `SELECT id FROM job_posts WHERE id = $1 AND company_id = $2`,
            [jobId, companyId]
        );

        if (jobCheck.rows.length === 0) {
            return res
                .status(403)
                .json({ message: "Unauthorized to update this application" });
        }

        // ✏️ Update status
        const result = await pool.query(
            `UPDATE job_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, applicationId]
        );

        const updatedApplication = result.rows[0];

        // 🔔 Trigger notification
        if (status === "accepted") {
            await triggerNotification({
                recipientId: developerId,
                recipientType: "developer",
                senderId: companyId,
                senderType: "company",
                title: "Application Accepted",
                message: `You have been accepted for the job: ${jobTitle}`,
                type: "job_acceptance",
            });
        } else if (status === "rejected") {
            await triggerNotification({
                recipientId: developerId,
                recipientType: "developer",
                senderId: companyId,
                senderType: "company",
                title: "Application Rejected",
                message: `Your application for the job ${jobTitle} was not accepted.`,
                type: "job_rejection",
            });
        }

        // ✅ Response
        res.json({
            message: "Application status updated successfully",
            application: updatedApplication,
        });
    } catch (error) {
        console.error("❌ Error in updateApplicationStatus:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    applyForJob,
    getJobApplications,
    withdrawApplication,
    updateApplicationStatus,
};
