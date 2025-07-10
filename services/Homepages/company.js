const { pool } = require("../../config/db");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Get basic company info
async function getCompanyInfo(companyId) {
    const query = `
        SELECT company_name, industry, profile_picture
        FROM companies
        WHERE id = $1
    `;
    const result = await pool.query(query, [companyId]);
    const company = result.rows[0];

    if (!company) return null;

    return {
        ...company,
        profile_picture: company.profile_picture
            ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                  company.profile_picture
              )}`
            : null,
    };
}

// ✅ Updated: Get latest available developers (limit 10)
async function getAvailableDevelopers() {
    const query = `
        SELECT id, first_name, last_name, current_track, track_level, profile_picture
        FROM developers
        ORDER BY created_at DESC
        LIMIT 10
    `;
    const result = await pool.query(query);

    return result.rows.map((dev) => ({
        id: dev.id,
        firstName: dev.first_name,
        lastName: dev.last_name,
        currentTrack: dev.current_track,
        trackLevel: dev.track_level,
        profilePicture: dev.profile_picture
            ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                  dev.profile_picture
              )}`
            : null,
    }));
}

// ✅ Updated: Get recent developers who applied to company's jobs
async function getRecentAppliedDevelopers(companyId) {
    const query = `
        SELECT 
            d.id AS developer_id,
            d.first_name,
            d.last_name,
            d.address,
            d.profile_picture,
            ja.uploaded_cv,
            ja.years_of_experience,
            ja.expected_salary,
            ja.created_at AS application_date,
            ja.status,
            jp.title AS job_title,
            ja.id AS application_id
        FROM job_applications ja
        JOIN developers d ON d.id = ja.developer_id
        JOIN job_posts jp ON jp.id = ja.job_id
        WHERE jp.company_id = $1
        ORDER BY ja.created_at DESC
        LIMIT 10
    `;
    const result = await pool.query(query, [companyId]);

    return result.rows.map((row) => ({
        developerId: row.developer_id,
        firstName: row.first_name,
        lastName: row.last_name,
        address: row.address,
        profilePicture: row.profile_picture
            ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                  row.profile_picture
              )}`
            : null,
        uploadedCv: row.uploaded_cv,
        uploadedCvLink: row.uploaded_cv
            ? `${BASE_URL}/${row.uploaded_cv}`
            : null,
        yearsOfExperience: row.years_of_experience,
        expectedSalary: row.expected_salary,
        applicationDate: row.application_date,
        status: row.status,
        jobTitle: row.job_title,
        applicationId: row.application_id,
    }));
}

// ✅ Updated: Get uploaded and/or generated CV of a developer
async function getDeveloperCv(developerId) {
    const query = `
        SELECT uploaded_cv
        FROM job_applications
        WHERE developer_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [developerId]);

    if (rows.length === 0) {
        throw new Error("No job applications found for this developer");
    }

    return {
        uploaded_cv: rows[0].uploaded_cv,
        uploaded_cv_link: rows[0].uploaded_cv
            ? `${BASE_URL}/${rows[0].uploaded_cv}`
            : null,
    };
}

// ✅ Updated: Get full job application with developer + job
async function getJobApplicationDetails(applicationId) {
    const query = `
        SELECT 
            ja.id AS application_id,
            ja.name AS applicant_name,
            ja.email AS applicant_email,
            ja.phone,
            ja.years_of_experience,
            ja.expected_salary,
            ja.uploaded_cv,
            ja.status,
            ja.created_at AS application_date,
            d.first_name,
            d.last_name,
            d.address,
            d.city,
            d.country,
            d.brief_bio,
            d.profile_picture,
            CONCAT(
                INITCAP(LOWER(d.track_level)), 
                ' ', 
                INITCAP(LOWER(d.current_track))
            ) AS track_title,
            jp.title AS job_title,
            jp.location AS job_location
        FROM job_applications ja
        JOIN developers d ON ja.developer_id = d.id
        JOIN job_posts jp ON ja.job_id = jp.id
        WHERE ja.id = $1
    `;
    const { rows } = await pool.query(query, [applicationId]);

    if (rows.length === 0) {
        throw new Error("Application not found");
    }

    const app = rows[0];

    return {
        applicationId: app.application_id,
        applicantName: app.applicant_name,
        applicantEmail: app.applicant_email,
        phone: app.phone,
        yearsOfExperience: app.years_of_experience,
        expectedSalary: app.expected_salary,
        uploadedCv: app.uploaded_cv,
        uploadedCvLink: app.uploaded_cv
            ? `${BASE_URL}/${app.uploaded_cv}`
            : null,
        status: app.status,
        applicationDate: app.application_date,
        firstName: app.first_name,
        lastName: app.last_name,
        address: app.address,
        city: app.city,
        country: app.country,
        brief_bio: app.brief_bio,
        profilePicture: app.profile_picture
            ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                  app.profile_picture
              )}`
            : null,
        trackTitle: app.track_title,
        jobTitle: app.job_title,
        jobLocation: app.job_location,
    };
}

module.exports = {
    getCompanyInfo,
    getAvailableDevelopers,
    getRecentAppliedDevelopers,
    getDeveloperCv,
    getJobApplicationDetails,
};

// const { pool } = require("../../config/db"); // or your actual DB client
// const BASE_URL = process.env.BASE_URL;

// // Get basic company info
// async function getCompanyInfo(companyId) {
//     const query = `
//     SELECT company_name, industry, profile_picture
//     FROM companies
//     WHERE id = $1
//   `;
//     const result = await pool.query(query, [companyId]);
//     return result.rows[0];
// }

// // Get latest available developers (limit 10)
// async function getAvailableDevelopers() {
//     const query = `
//     SELECT id, first_name, last_name, current_track, track_level
//     FROM developers
//     ORDER BY created_at DESC
//     LIMIT 10
//   `;
//     const result = await pool.query(query);
//     return result.rows;
// }

// async function getRecentAppliedDevelopers(companyId) {
//     const query = `
//     SELECT
//       d.id AS developer_id,
//       d.first_name,
//       d.last_name,
//       d.address,
//       ja.uploaded_cv,
//       ja.years_of_experience,
//       ja.expected_salary,
//       ja.created_at AS application_date,
//       ja.status,
//       jp.title AS job_title,
//       ja.id AS application_id
//     FROM job_applications ja
//     JOIN developers d ON d.id = ja.developer_id
//     JOIN job_posts jp ON jp.id = ja.job_id
//     WHERE jp.company_id = $1
//     ORDER BY ja.created_at DESC
//     LIMIT 10
//   `;
//     const result = await pool.query(query, [companyId]);

//     return result.rows.map((row) => ({
//         developerId: row.developer_id,
//         firstName: row.first_name,
//         lastName: row.last_name,
//         address: row.address,
//         uploadedCv: row.uploaded_cv,
//         uploadedCvLink: row.uploaded_cv
//             ? `${BASE_URL}/${row.uploaded_cv}`
//             : null,
//         yearsOfExperience: row.years_of_experience,
//         expectedSalary: row.expected_salary,
//         applicationDate: row.application_date,
//         status: row.status,
//         jobTitle: row.job_title,
//         applicationId: row.application_id,
//     }));
// }

// // Get uploaded and/or generated CV of a developer
// async function getDeveloperCv(developerId) {
//     const query = `
//     SELECT uploaded_cv
//     FROM developers
//     WHERE id = $1
//   `;
//     const values = [developerId];

//     const { rows } = await pool.query(query, values);

//     if (rows.length === 0) {
//         throw new Error("Developer not found");
//     }

//     return {
//         uploaded_cv: rows[0].uploaded_cv,
//         uploaded_cv_link: rows[0].uploaded_cv
//             ? `${BASE_URL}/${rows[0].uploaded_cv}`
//             : null,
//     };
// }

// // Get detailed job application info (with developer + job info)
// async function getJobApplicationDetails(applicationId) {
//     const query = `
//     SELECT
//       ja.id AS application_id,
//       ja.name AS applicant_name,
//       ja.email AS applicant_email,
//       ja.phone,
//       ja.years_of_experience,
//       ja.expected_salary,
//       ja.uploaded_cv,
//       ja.status,
//       ja.created_at AS application_date,
//       d.first_name,
//       d.last_name,
//       d.address,
//       d.city,
//       d.country,
//       d.profile_picture,
//       jp.title AS job_title,
//       jp.location AS job_location
//     FROM job_applications ja
//     JOIN developers d ON ja.developer_id = d.id
//     JOIN job_posts jp ON ja.job_id = jp.id
//     WHERE ja.id = $1
//   `;
//     const values = [applicationId];

//     const { rows } = await pool.query(query, values);

//     if (rows.length === 0) {
//         throw new Error("Application not found");
//     }

//     return rows[0];
// }

// module.exports = {
//     getCompanyInfo,
//     getAvailableDevelopers,
//     getRecentAppliedDevelopers,
//     getDeveloperCv,
//     getJobApplicationDetails,
// };
