require("dotenv").config();
const { pool } = require("../../config/db"); // assumes you're using pg or similar db instance
// const BASE_CV_URL = `${process.env.BASE_URL}/uploads/cvs/`;
const BASE_URL = process.env.BASE_URL;

// 🔹 Get Company Info by ID
const getCompanyInfo = async (companyId) => {
    const query = `
        SELECT id, company_name, country, city, address, phone_number, email, profile_picture, brief_description
        FROM companies
        WHERE id = $1
    `;
    const result = await pool.query(query, [companyId]);

    if (result.rows.length === 0) throw new Error("Company not found");

    const company = result.rows[0];

    // Only prepend BASE_URL if it's a relative path (not already a full URL)
    if (
        company.profile_picture &&
        !company.profile_picture.startsWith("http")
    ) {
        company.profile_picture = `${BASE_URL}/uploads/profile_pictures/${company.profile_picture}`;
    }

    return company;
};

// 🔹 Get Job Posts by Company ID
const getCompanyJobPosts = async (companyId) => {
    const jobQuery = `
        SELECT 
            jp.id, 
            jp.title, 
            jp.location,
            c.company_name
        FROM job_posts jp
        JOIN companies c ON jp.company_id = c.id
        WHERE jp.company_id = $1
        ORDER BY jp.created_at DESC
    `;

    const countQuery = `
        SELECT COUNT(*) AS total_jobs
        FROM job_posts
        WHERE company_id = $1
    `;

    const [jobResult, countResult] = await Promise.all([
        pool.query(jobQuery, [companyId]),
        pool.query(countQuery, [companyId]),
    ]);

    // Extract the company name from the first job row (if any)
    const companyName = jobResult.rows[0]?.company_name || null;

    // Clean up the job rows to remove duplicate company_name field
    const jobs = jobResult.rows.map(({ company_name, ...rest }) => rest);

    return {
        totalJobs: parseInt(countResult.rows[0].total_jobs, 10),
        companyName,
        jobs,
    };
};

// 🔹 Get Total Number of Applicants for Company
const getCompanyTotalApplicants = async (companyId) => {
    const query = `
    SELECT COUNT(*) AS total_applicants
    FROM job_applications
    WHERE job_id IN (
      SELECT id FROM job_posts WHERE company_id = $1
    )
  `;
    const result = await pool.query(query, [companyId]);
    return parseInt(result.rows[0].total_applicants, 10);
};

// 🔹 Get Job Posts with Applicant Count Per Post
const getCompanyJobPostsWithApplicants = async (companyId) => {
    const query = `
    SELECT jp.id, jp.title, jp.location, COUNT(ja.id) AS applicant_count
    FROM job_posts jp
    LEFT JOIN job_applications ja ON jp.id = ja.job_id
    WHERE jp.company_id = $1
    GROUP BY jp.id, jp.title, jp.location
    ORDER BY jp.created_at DESC
  `;
    const result = await pool.query(query, [companyId]);

    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        location: row.location,
        applicantCount: parseInt(row.applicant_count, 10),
    }));
};

// 🔹 Get Job Posts + Full Developer Applicant Info
const getCompanyJobPostsWithApplicantDetails = async (companyId) => {
    const query = `
    SELECT 
      jp.id AS job_id,
      jp.title,
      jp.location,
      jp.created_at AS job_posted_date,

      d.id AS developer_id,
      d.first_name,
      d.last_name,
      d.email,
      d.gender,
      d.date_of_birth,
      d.phone_number,
      d.country,
      d.city,
      d.address,
      d.brief_bio,
      d.skills,
      d.current_track,
      d.track_level,
      d.previous_job,
      d.type_of_job,
      d.years_of_experience,
      d.expected_salary,
      d.interested_courses,
      d.profile_picture,
      d.created_at AS developer_created_at,
      d.updated_at AS developer_updated_at,
      d.uploaded_cv,

      ja.status AS application_status,
      ja.created_at AS application_date,
      ja.uploaded_cv AS applicant_cv,

      -- Latest generated CV for this developer
      gc.file_path AS generated_cv_path

    FROM job_posts jp
    LEFT JOIN job_applications ja ON jp.id = ja.job_id
    LEFT JOIN developers d ON ja.developer_id = d.id
    LEFT JOIN LATERAL (
        SELECT file_path
        FROM generated_cvs
        WHERE developer_id = d.id AND active = true
        ORDER BY created_at DESC
        LIMIT 1
    ) gc ON true
    WHERE jp.company_id = $1
    ORDER BY jp.created_at DESC
  `;

    const result = await pool.query(query, [companyId]);

    const grouped = {};

    for (const row of result.rows) {
        const jobId = row.job_id;

        if (!grouped[jobId]) {
            grouped[jobId] = {
                id: jobId,
                title: row.title,
                location: row.location,
                postedDate: row.job_posted_date,
                applicants: [],
            };
        }

        if (row.email) {
            grouped[jobId].applicants.push({
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                gender: row.gender,
                dateOfBirth: row.date_of_birth,
                phoneNumber: row.phone_number,

                country: row.country,
                city: row.city,
                address: row.address,

                briefBio: row.brief_bio,
                skills: row.skills,
                currentTrack: row.current_track,
                trackLevel: row.track_level,
                previousJob: row.previous_job,
                typeOfJob: row.type_of_job,
                yearsOfExperience: row.years_of_experience,
                expectedSalary: row.expected_salary,
                interestedCourses: row.interested_courses,

                applicationStatus: row.application_status,
                applicationDate: row.application_date,
                applicantCv: row.applicant_cv,
                applicantCvLink: row.applicant_cv
                    ? `${BASE_URL}${row.applicant_cv}`
                    : null,

                profilePicture: row.profile_picture
                    ? `${BASE_URL}${row.profile_picture}`
                    : null,

                uploadedCv: row.uploaded_cv,
                uploadedCvLink: row.uploaded_cv
                    ? `${BASE_URL}${row.uploaded_cv}`
                    : null,

                generatedCvPath: row.generated_cv_path,
                generatedCvLink: row.generated_cv_path
                    ? `${BASE_URL}${row.generated_cv_path}`
                    : null,

                createdAt: row.developer_created_at,
                updatedAt: row.developer_updated_at,
            });
        }
    }

    return Object.values(grouped);
};

module.exports = {
    getCompanyJobPostsWithApplicantDetails,
};

const deleteJobPost = async (companyId, jobId) => {
    // Ensure the job belongs to the company
    const jobCheckQuery = `
      SELECT id FROM job_posts WHERE id = $1 AND company_id = $2
    `;
    const jobResult = await pool.query(jobCheckQuery, [jobId, companyId]);

    if (jobResult.rows.length === 0) {
        throw new Error("Job not found or does not belong to this company");
    }

    // Delete the job
    const deleteQuery = `DELETE FROM job_posts WHERE id = $1`;
    await pool.query(deleteQuery, [jobId]);
};

const updateCompanyProfile = async (companyId, data) => {
    const allowedFields = [
        "company_name",
        "brief_description",
        "country",
        "city",
        "address",
        "website",
        "industry",
        "contact_name",
        "contact_email",
        "phone_number",
        "social_media_links",
        "profile_picture",
    ];

    const safeReturnFields = `
      id, company_name, email, brief_description, country, city,
      address, website, industry, contact_name, contact_email,
      phone_number, social_media_links, role, profile_picture
  `;

    // Filter only provided fields
    const fieldsToUpdate = [];
    const values = [];
    let index = 1;

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            fieldsToUpdate.push(`${key} = $${index}`);
            values.push(data[key]);
            index++;
        }
    }

    if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    const query = `
      UPDATE companies
      SET ${fieldsToUpdate.join(", ")}
      WHERE id = $${index}
      RETURNING ${safeReturnFields};
  `;

    values.push(companyId); // Add companyId as last param

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getCompanyInfo,
    getCompanyJobPosts,
    getCompanyTotalApplicants,
    getCompanyJobPostsWithApplicants,
    getCompanyJobPostsWithApplicantDetails,
    deleteJobPost,
    updateCompanyProfile,
};
