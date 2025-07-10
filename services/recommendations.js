const { pool } = require('../config/db');
const sendToAIModel = require('../utils/sendToAIModel');
const extractPdfText = require('../utils/extractPdfText');
const path = require('path');
const fs = require('fs');

const getRecommendationsForDeveloper = async (developerId) => {
  try {
    // 🔹 1. Fetch uploaded CV from developers table
    // 1️⃣ Fetch generated CV path from generated_cvs table
    const generatedCVRes = await pool.query(
      `SELECT file_path FROM generated_cvs WHERE developer_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [developerId]
    );

    let developerCvText = null;
    let foundCV = false;

    if (generatedCVRes.rows.length > 0 && generatedCVRes.rows[0].file_path) {
      const fullUrl = generatedCVRes.rows[0].file_path;
      console.log("📁 Generated CV Path from DB:", fullUrl);

      // Extract just filename
      const filename = path.basename(fullUrl);
      const filePath = path.join(__dirname, '../uploads/cvs', filename);

      if (fs.existsSync(filePath)) {
        console.log("✅ Found generated CV file:", filePath);
        developerCvText = await extractPdfText(filePath);
        foundCV = true;
      } else {
        console.warn("❌ Generated CV file not found at:", filePath);
      }
    }

    // 2️⃣ Fallback to uploaded_cv if no valid generated CV found
    if (!foundCV) {
      const devRes = await pool.query(
        `SELECT uploaded_cv FROM developers WHERE id = $1`,
        [developerId]
      );

      const uploadedCvFile = devRes.rows[0]?.uploaded_cv;
      if (uploadedCvFile && uploadedCvFile.trim() !== '') {
        const uploadedPath = path.join(__dirname, '../uploads/cvs', uploadedCvFile);
        if (fs.existsSync(uploadedPath)) {
          console.log("✅ Fallback to uploaded CV:", uploadedPath);
          developerCvText = await extractPdfText(uploadedPath);
        } else {
          throw new Error('Uploaded CV file not found on server');
        }
      } else {
        throw new Error('No usable CV found for recommendations');
      }
    }

    if (!developerCvText) {
      throw new Error('Failed to extract text from available CV');
    }

    // 🔹 Clean up and normalize
    const cleanCvText = developerCvText
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();

    // 🔹 3. Fetch all job posts
    const jobPostsRes = await pool.query(`
      SELECT 
        id::text, title, job_description AS description,
        COALESCE(skills, '{}') AS skills
      FROM job_posts
    `);
    const jobPosts = jobPostsRes.rows;

    // 🔹 4. Fetch all service posts
    const servicePostsRes = await pool.query(`
      SELECT 
        id::text, title, description,
        COALESCE(required_skills, '{}') AS skills
      FROM service_posts
    `);
    const servicePosts = servicePostsRes.rows;

    // 🔹 5. Send to AI model
    const aiResponse = await sendToAIModel({
      developer_cv: cleanCvText,
      job_posts: jobPosts,
      service_posts: servicePosts
    });

    const recommendedJobIds = aiResponse?.recommendedJobs || [];
    const recommendedServiceIds = aiResponse?.recommendedServices || [];

    // 🔹 6. Fetch job posts by recommended IDs
    let recommendedJobs = [];
    if (recommendedJobIds.length > 0) {
      const jobQuery = `
        SELECT id, title, job_type, location, salary_range, experience_required, job_description,
               responsibilities, qualifications, benefits, skills, category, company_name
        FROM job_posts
        WHERE id::text = ANY($1::text[])
      `;
      const jobResult = await pool.query(jobQuery, [recommendedJobIds]);
      recommendedJobs = jobResult.rows;
    }

    // 🔹 7. Fetch service posts by recommended IDs
    let recommendedServices = [];
    if (recommendedServiceIds.length > 0) {
      const serviceQuery = `
        SELECT id, title, description, budget_range, service_type, required_skills
        FROM service_posts
        WHERE id::text = ANY($1::text[])
      `;
      const serviceResult = await pool.query(serviceQuery, [recommendedServiceIds]);
      recommendedServices = serviceResult.rows;
    }

    // 🔹 8. Return both lists
    return {
      jobs: recommendedJobs,
      services: recommendedServices
    };

  } catch (error) {
    console.error('Recommendation Service Error:', error);
    throw error;
  }
};

module.exports = {
  getRecommendationsForDeveloper
};









// const { pool } = require('../config/db');
// const sendToAIModel = require('../utils/sendToAIModel');
// const extractPdfText = require('../utils/extractPdfText');
// const path = require('path');
// const fs = require('fs');
// // const { UUID } = require('pg').types;

// const getRecommendationsForDeveloper = async (developerId) => {
//   try {
//     // 1️⃣ Fetch developer and CV info
//     const devRes = await pool.query(
//       `SELECT generated_cv, uploaded_cv FROM developers WHERE id = $1`,
//       [developerId]
//     );

//     if (devRes.rows.length === 0) {
//       throw new Error('Developer not found');
//     }

//     const { generated_cv, uploaded_cv } = devRes.rows[0];
//     let developerCvText = null;

//     // Prefer generated CV
//     if (generated_cv && generated_cv.trim() !== '') {
//       developerCvText = generated_cv;
//     } else if (uploaded_cv && uploaded_cv.trim() !== '') {
//       const filePath = path.join(__dirname, '../uploads/cvs', uploaded_cv); // Adjust if path is different
//       if (!fs.existsSync(filePath)) {
//         throw new Error('Uploaded CV file not found on server');
//       }
//       developerCvText = await extractPdfText(filePath);
//       if (!developerCvText) {
//         throw new Error('Failed to extract text from uploaded CV');
//       }
//     } else {
//       throw new Error('No CV available for recommendations');
//     }

//     // 2️⃣ Fetch all job posts
//     const jobPostsRes = await pool.query(`
//         SELECT 
//             id::text,  -- Convert UUID to string
//             title,
//             job_description AS description,
//             COALESCE(skills, '{}') AS skills  -- Ensure array, not null
//         FROM job_posts
//     `);
//     const jobPosts = jobPostsRes.rows;

//     // 3️⃣ Fetch all service posts
//     const servicePostsRes = await pool.query(`
//         SELECT 
//             id::text,  -- Convert UUID to string
//             title,
//             description,
//             COALESCE(required_skills, '{}') AS skills  -- Ensure array, not null
//         FROM service_posts
//     `);
//     const servicePosts = servicePostsRes.rows;

//     const cleanCvText = developerCvText
//         .replace(/[^\w\s]|_/g, "") // Remove punctuation
//         .replace(/\s+/g, " ")       // Normalize whitespace
//         .toLowerCase();

//     console.log("Developer CV text length:", cleanCvText.length);
//     console.log("Job posts to send:", jobPosts.length);
//     console.log("Service posts to send:", servicePosts.length);

//     // 4️⃣ Send data to external AI model
//     const aiResponse = await sendToAIModel({
//         developer_cv: cleanCvText,
//         job_posts: jobPosts.map(job => ({
//             id: job.id,  // Already string from query
//             title: job.title || '',
//             description: job.description || '',  // Matches database
//             skills: job.skills || []  // Ensure array
//         })),
//         service_posts: servicePosts.map(service => ({
//             id: service.id,  // Already string from query
//             title: service.title || '',
//             description: service.description || '',  // Matches database
//             skills: service.skills || []  // Ensure array
//         }))
//     });

//     console.log("Raw AI response:", aiResponse);

//     // const { recommendedJobIds = [], recommendedServiceIds = [] } = aiResponse || {};
//     const recommendedJobIds = aiResponse?.recommendedJobs || [];
//     const recommendedServiceIds = aiResponse?.recommendedServices || [];

//     console.log("Recommended Job IDs:", recommendedJobIds);
//     console.log("Recommended Service IDs:", recommendedServiceIds);

//     // 5️⃣ Fetch recommended jobs (FIXED)
//     let recommendedJobs = [];
//     if (recommendedJobIds.length > 0) {
//         // Convert string IDs to UUID objects
//         // const jobIds = recommendedJobIds.map(id => new UUID(id)); // 👈 CRITICAL FIX
  
//         // const jobQuery = `
//         //     SELECT id, title, job_type, location, salary_range, experience_required, job_description,
//         //         responsibilities, qualifications, benefits, skills, category, company_name
//         //     FROM job_posts
//         //     WHERE id = ANY($1::uuid[])  -- 👈 Explicit cast to uuid[]
//         // `;
//         const jobQuery = `
//             SELECT id, title, job_type, location, salary_range, experience_required, job_description,
//                 responsibilities, qualifications, benefits, skills, category, company_name
//             FROM job_posts
//             WHERE id::text = ANY($1::text[])  -- Compare as text strings
//         `;
//         console.log("Querying jobs with IDs:", recommendedJobIds);
//         const jobResult = await pool.query(jobQuery, [recommendedJobIds]); // Pass UUID array
//         recommendedJobs = jobResult.rows;
//         console.log("Jobs found:", jobResult.rows.length);
//     }

//     // 6️⃣ Fetch recommended services (FIXED)
//     let recommendedServices = [];
//     if (recommendedServiceIds.length > 0) {
//         // Convert string IDs to UUID objects
//         // const serviceIds = recommendedServiceIds.map(id => new UUID(id)); // 👈 CRITICAL FIX
  
//         // const serviceQuery = `
//         //     SELECT id, title, description, budget_range, service_type, required_skills
//         //     FROM service_posts
//         //     WHERE id = ANY($1::uuid[])  -- 👈 Explicit cast to uuid[]
//         // `;
//         const serviceQuery = `
//             SELECT id, title, description, budget_range, service_type, required_skills
//             FROM service_posts
//             WHERE id::text = ANY($1::text[])  -- Compare as text strings
//         `;
//         console.log("Querying services with IDs:", recommendedServiceIds);
//         const serviceResult = await pool.query(serviceQuery, [recommendedServiceIds]); // Pass UUID array
//         recommendedServices = serviceResult.rows;
//         console.log("Services found:", serviceResult.rows.length);
//     }
    
//     // // 5️⃣ Fetch recommended jobs
//     // let recommendedJobs = [];
//     // if (recommendedJobIds.length > 0) {
//     //   const jobQuery = `
//     //     SELECT id, title, job_type, location, salary_range, experience_required, job_description,
//     //            responsibilities, qualifications, benefits, skills, category, company_name
//     //     FROM job_posts
//     //     WHERE id = ANY($1)
//     //   `;
//     //   const jobResult = await pool.query(jobQuery, [recommendedJobIds]);
//     //   recommendedJobs = jobResult.rows;
//     // }

//     // // 6️⃣ Fetch recommended services
//     // let recommendedServices = [];
//     // if (recommendedServiceIds.length > 0) {
//     //   const serviceQuery = `
//     //     SELECT id, title, description, budget_range, service_type, required_skills
//     //     FROM service_posts
//     //     WHERE id = ANY($1)
//     //   `;
//     //   const serviceResult = await pool.query(serviceQuery, [recommendedServiceIds]);
//     //   recommendedServices = serviceResult.rows;
//     // }

//     // 7️⃣ Return combined result
//     return {
//       jobs: recommendedJobs,
//       services: recommendedServices
//     };
//   } catch (error) {
//     console.error('Recommendation Service Error:', error);
//     throw error;
//   }
// };

// module.exports = {
//   getRecommendationsForDeveloper
// };
