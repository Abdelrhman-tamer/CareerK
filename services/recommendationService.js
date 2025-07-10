const { pool } = require("../config/db");
const axios = require("axios");
const path = require("path");
const fetchCVText = require("../utils/fetchCVText");
const { FASTAPI_URL } = require("../config/ai-url");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

exports.getRecommendations = async (developerId) => {
    // STEP 1: Load developer
    const developerRes = await pool.query(
        `SELECT * FROM developers WHERE id = $1`,
        [developerId]
    );
    const developer = developerRes.rows[0];
    if (!developer) throw new Error("Developer not found");

    // STEP 2: Uploaded CV info
    let uploadedCvText = developer.uploaded_cv_text || null; // RAW TEXT (if added)
    let uploadedCvPath = null;

    if (
        developer.uploaded_cv &&
        (developer.uploaded_cv.startsWith("http") ||
            developer.uploaded_cv.endsWith(".pdf"))
    ) {
        uploadedCvPath = path.basename(developer.uploaded_cv);
    }

    // STEP 3: Generated CV path from table
    const generatedCvRes = await pool.query(
        `SELECT file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [developerId]
    );
    const rawPath = generatedCvRes.rows[0]?.file_path || null;
    const generatedCvPath = rawPath ? path.basename(rawPath) : null;

    // STEP 4: Fetch full CV text (combined)
    const cvText = await fetchCVText({
        generatedCvText: null, // you no longer store generated text directly
        uploadedCvText,
        generatedCvPath,
        uploadedCvPath,
    });

    if (!cvText) {
        console.warn(`⚠️ Developer ${developerId} has no usable CV text`);
    } else {
        console.log("🧠 Combined CV Text Preview:", cvText.slice(0, 200));
    }

    // STEP 5: Load job + service posts
    const jobsRes = await pool.query(`
    SELECT id, title, job_description, skills, experience_required
    FROM job_posts
    ORDER BY created_at DESC
    LIMIT 50
  `);

    const servicesRes = await pool.query(`
    SELECT id, title, description, required_skills
    FROM service_posts
    ORDER BY created_at DESC
    LIMIT 50
  `);

    // STEP 6: Send to FastAPI
    const payload = {
        developer: {
            id: developer.id,
            brief_bio: developer.brief_bio,
            skills: developer.skills,
            years_of_experience: developer.years_of_experience,
            previous_job: developer.previous_job,
            track_level: developer.track_level,
            cv_text: cvText, // ✅ unified
        },
        job_posts: jobsRes.rows,
        service_posts: servicesRes.rows,
    };

    const response = await axios.post(FASTAPI_URL, payload);
    const { job_recommendations, service_recommendations } = response.data;

    // STEP 7: Enrich job posts
    const jobIds = job_recommendations.map((j) => j.id);
    const fullJobsRes = await pool.query(
        `
    SELECT jp.*, c.profile_picture AS company_profile_picture, c.company_name
    FROM job_posts jp
    JOIN companies c ON c.id = jp.company_id
    WHERE jp.id = ANY($1)
  `,
        [jobIds]
    );

    const jobMap = {};
    fullJobsRes.rows.forEach((j) => {
        jobMap[j.id] = {
            ...j,
            company_profile_picture: j.company_profile_picture
                ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                      j.company_profile_picture
                  )}`
                : null,
            company_name: j.company_name,
        };
    });

    // STEP 8: Enrich service posts
    const serviceIds = service_recommendations.map((s) => s.id);
    const fullServicesRes = await pool.query(
        `
    SELECT sp.*, cu.name AS customer_name, cu.profile_picture AS customer_profile_picture
    FROM service_posts sp
    JOIN customers cu ON cu.id = sp.customer_id
    WHERE sp.id = ANY($1)
  `,
        [serviceIds]
    );

    const serviceMap = {};
    fullServicesRes.rows.forEach((s) => {
        serviceMap[s.id] = {
            ...s,
            customer_name: s.customer_name,
            customer_profile_picture: s.customer_profile_picture
                ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                      s.customer_profile_picture
                  )}`
                : null,
        };
    });

    // STEP 9: Combine scores + full info
    const enrichedJobs = job_recommendations.map((j) => ({
        ...jobMap[j.id],
        score: j.score,
    }));

    const enrichedServices = service_recommendations.map((s) => ({
        ...serviceMap[s.id],
        score: s.score,
    }));

    // STEP 10: Return
    return {
        job_recommendations: enrichedJobs,
        service_recommendations: enrichedServices,
    };
};

// const { pool } = require("../config/db");
// const axios = require("axios");
// const path = require("path");
// const fetchCVText = require("../utils/fetchCVText");
// const { FASTAPI_URL } = require("../config/ai-url");

// const BASE_URL = process.env.BASE_URL || "http://localhost:3000"; // fallback

// exports.getRecommendations = async (developerId) => {
//     // STEP 1: Load developer profile
//     const developerRes = await pool.query(
//         `SELECT * FROM developers WHERE id = $1`,
//         [developerId]
//     );
//     const developer = developerRes.rows[0];
//     if (!developer) throw new Error("Developer not found");

//     // STEP 2: Uploaded CV
//     let uploadedCvText = developer.uploaded_cv || null;
//     let uploadedCvPath = null;

//     if (
//         uploadedCvText &&
//         (uploadedCvText.startsWith("http") || uploadedCvText.endsWith(".pdf"))
//     ) {
//         uploadedCvPath = path.basename(uploadedCvText);
//         uploadedCvText = null;
//     }

//     // STEP 3: Latest generated CV
//     const generatedCvRes = await pool.query(
//         `SELECT file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
//         [developerId]
//     );
//     const rawPath = generatedCvRes.rows[0]?.file_path || null;
//     const generatedCvPath = rawPath ? path.basename(rawPath) : null;

//     // STEP 4: Extract CV text
//     const cvText = await fetchCVText({ uploadedCvPath, generatedCvPath });

//     if (!cvText && !uploadedCvText) {
//         console.warn(`⚠️ Developer ${developerId} has no usable CV text.`);
//     } else if (cvText) {
//         console.log("🧠 Generated CV Text Preview:", cvText.slice(0, 200));
//     } else if (uploadedCvText) {
//         console.log(
//             "🧠 Uploaded CV Text Preview:",
//             uploadedCvText.slice(0, 200)
//         );
//     }

//     // STEP 5: Load job and service posts (basic fields)
//     const jobsRes = await pool.query(`
//         SELECT id, title, job_description, skills
//         FROM job_posts
//         ORDER BY created_at DESC
//         LIMIT 50
//     `);

//     const servicesRes = await pool.query(`
//         SELECT id, title, description, required_skills
//         FROM service_posts
//         ORDER BY created_at DESC
//         LIMIT 50
//     `);

//     // STEP 6: Send to FastAPI
//     const payload = {
//         developer: {
//             id: developer.id,
//             brief_bio: developer.brief_bio,
//             skills: developer.skills,
//             years_of_experience: developer.years_of_experience,
//             previous_job: developer.previous_job,
//             track_level: developer.track_level,
//             uploaded_cv_text: uploadedCvText,
//             generated_cv_text: cvText,
//         },
//         job_posts: jobsRes.rows,
//         service_posts: servicesRes.rows,
//     };

//     const response = await axios.post(FASTAPI_URL, payload);
//     const { job_recommendations, service_recommendations } = response.data;

//     // STEP 7: Fetch full job records + company profile_picture
//     const jobIds = job_recommendations.map((j) => j.id);
//     const fullJobsRes = await pool.query(
//         `
//         SELECT jp.*, c.profile_picture AS company_profile_picture, c.company_name
//         FROM job_posts jp
//         JOIN companies c ON c.id = jp.company_id
//         WHERE jp.id = ANY($1)
//     `,
//         [jobIds]
//     );

//     const jobMap = {};
//     fullJobsRes.rows.forEach((j) => {
//         jobMap[j.id] = {
//             ...j,
//             company_profile_picture: j.company_profile_picture
//                 ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
//                       j.company_profile_picture
//                   )}`
//                 : null,
//             company_name: j.company_name,
//         };
//     });

//     // STEP 8: Fetch full service records + customer profile_picture
//     const serviceIds = service_recommendations.map((s) => s.id);
//     const fullServicesRes = await pool.query(
//         `
//         SELECT sp.*, cu.name AS customer_name, cu.profile_picture AS customer_profile_picture
//         FROM service_posts sp
//         JOIN customers cu ON cu.id = sp.customer_id
//         WHERE sp.id = ANY($1)
//     `,
//         [serviceIds]
//     );

//     const serviceMap = {};
//     fullServicesRes.rows.forEach((s) => {
//         serviceMap[s.id] = {
//             ...s,
//             customer_name: s.customer_name,
//             customer_profile_picture: s.customer_profile_picture
//                 ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
//                       s.customer_profile_picture
//                   )}`
//                 : null,
//         };
//     });

//     // STEP 9: Merge score + post
//     const enrichedJobs = job_recommendations.map((j) => ({
//         ...jobMap[j.id],
//         score: j.score,
//     }));

//     const enrichedServices = service_recommendations.map((s) => ({
//         ...serviceMap[s.id],
//         score: s.score,
//     }));

//     // STEP 10: Return
//     return {
//         job_recommendations: enrichedJobs,
//         service_recommendations: enrichedServices,
//     };
// };
