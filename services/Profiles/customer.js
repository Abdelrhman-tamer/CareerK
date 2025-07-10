require("dotenv").config();
const { pool } = require("../../config/db");
const BASE_URL = process.env.BASE_URL;

// 🔹 Get Customer Info by ID
const getCustomerInfo = async (customerId) => {
    const query = `
    SELECT id, name, email, profile_picture, brief_description, contact_email, phone_number
    FROM customers
    WHERE id = $1
  `;
    const result = await pool.query(query, [customerId]);
    if (result.rows.length === 0) throw new Error("Customer not found");

    const customer = result.rows[0];

    return {
        ...customer,
        profile_picture: customer.profile_picture
            ? customer.profile_picture.startsWith("http")
                ? customer.profile_picture
                : `${BASE_URL}/uploads/profile_pictures/${customer.profile_picture.replace(
                      /^\/+/,
                      ""
                  )}`
            : null,
    };
};

// 🔹 Get Service Posts by Customer ID (with total count)
const getCustomerServicePosts = async (customerId) => {
    const query = `
    SELECT 
        sp.id,
        sp.title,
        sp.service_type,
        sp.budget_range,
        sp.created_at,
        c.profile_picture
    FROM service_posts sp
    JOIN customers c ON sp.customer_id = c.id
    WHERE sp.customer_id = $1
    ORDER BY sp.created_at DESC
  `;

    const result = await pool.query(query, [customerId]);

    const posts = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        serviceType: row.service_type,
        budgetRange: row.budget_range,
        createdAt: row.created_at,
        profilePicture: row.profile_picture
            ? row.profile_picture.startsWith("http")
                ? row.profile_picture
                : `${BASE_URL}/uploads/profile_pictures/${row.profile_picture.replace(
                      /^\/+/,
                      ""
                  )}`
            : null,
    }));

    return {
        total: posts.length,
        posts,
    };
};

// 🔹 Get Total Applicants for All Customer Service Posts
const getCustomerTotalApplicants = async (customerId) => {
    const query = `
    SELECT COUNT(*) AS total_applicants
    FROM service_applications
    WHERE service_post_id IN (
      SELECT id FROM service_posts WHERE customer_id = $1
    )
  `;
    const result = await pool.query(query, [customerId]);
    return parseInt(result.rows[0].total_applicants, 10);
};

// 🔹 Get Service Posts with Applicant Count
const getServicePostsWithApplicants = async (customerId) => {
    const query = `
    SELECT sp.id, sp.title, sp.service_type, COUNT(sa.id) AS applicant_count
    FROM service_posts sp
    LEFT JOIN service_applications sa ON sp.id = sa.service_post_id
    WHERE sp.customer_id = $1
    GROUP BY sp.id, sp.title, sp.service_type
    ORDER BY sp.created_at DESC
  `;
    const result = await pool.query(query, [customerId]);

    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        serviceType: row.service_type,
        applicantCount: parseInt(row.applicant_count, 10),
    }));
};

// 🔹 Get Service Posts with Full Applicant Details
const getServicePostsWithApplicantDetails = async (customerId) => {
    const query = `
    SELECT 
      sp.id AS service_post_id,
      sp.title,
      sp.service_type,
      sp.description,
      sp.budget_range,
      sp.required_skills,
      sp.deadline,
      sp.contact_info,
      sp.created_at AS service_posted_date,
      sp.updated_at AS service_updated_date,

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

      sa.status AS application_status,
      sa.created_at AS application_date,
      sa.uploaded_cv AS applicant_cv,

      gc.file_path AS generated_cv

    FROM service_posts sp
    LEFT JOIN service_applications sa ON sp.id = sa.service_post_id
    LEFT JOIN developers d ON sa.developer_id = d.id
    LEFT JOIN LATERAL (
        SELECT file_path
        FROM generated_cvs
        WHERE developer_id = d.id AND active = true
        ORDER BY created_at DESC
        LIMIT 1
    ) gc ON true
    WHERE sp.customer_id = $1
    ORDER BY sp.created_at DESC
  `;

    const result = await pool.query(query, [customerId]);

    const grouped = {};

    for (const row of result.rows) {
        const postId = row.service_post_id;

        if (!grouped[postId]) {
            grouped[postId] = {
                id: postId,
                title: row.title,
                serviceType: row.service_type,
                description: row.description,
                budget_range: row.budget_range,
                required_skills: row.required_skills,
                deadline: row.deadline,
                contact_info: row.contact_info,
                postedDate: row.service_posted_date,
                updatedDate: row.service_updated_date,
                applicants: [],
            };
        }

        if (row.email) {
            grouped[postId].applicants.push({
                // Personal Info
                developerId: row.developer_id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                gender: row.gender,
                dateOfBirth: row.date_of_birth,
                phoneNumber: row.phone_number,

                // Location
                country: row.country,
                city: row.city,
                address: row.address,

                // Professional
                briefBio: row.brief_bio,
                skills: row.skills,
                currentTrack: row.current_track,
                trackLevel: row.track_level,
                previousJob: row.previous_job,
                typeOfJob: row.type_of_job,
                yearsOfExperience: row.years_of_experience,
                expectedSalary: row.expected_salary,
                interestedCourses: row.interested_courses,

                // Application Info
                applicationStatus: row.application_status,
                applicationDate: row.application_date,
                applicantCv: row.applicant_cv,
                applicantCvLink: row.applicant_cv
                    ? `${BASE_URL}/${row.applicant_cv.replace(/^\/+/, "")}`
                    : null,

                // Files
                profilePicture: row.profile_picture
                    ? `${BASE_URL}/uploads/profile_pictures/${row.profile_picture
                          .split("/")
                          .pop()}`
                    : null,
                uploadedCv: row.uploaded_cv,
                uploadedCvLink: row.uploaded_cv
                    ? `${BASE_URL}/${row.uploaded_cv.replace(/^\/+/, "")}`
                    : null,
                generatedCv: row.generated_cv
                    ? `${BASE_URL}/${row.generated_cv.replace(/^\/+/, "")}`
                    : null,

                // Timestamps
                createdAt: row.developer_created_at,
                updatedAt: row.developer_updated_at,
            });
        }
    }

    return Object.values(grouped);
};

// const getCustomerInfo = async (customerId) => {
//     const query = `
//     SELECT id, name, email, profile_picture, brief_description, contact_email, phone_number
//     FROM customers
//     WHERE id = $1
//   `;
//     const result = await pool.query(query, [customerId]);
//     if (result.rows.length === 0) throw new Error("Customer not found");
//     return result.rows[0];
// };

// // 🔹 Get Service Posts by Customer ID
// const getCustomerServicePosts = async (customerId) => {
//     const query = `
//     SELECT id, title, service_type, created_at
//     FROM service_posts
//     WHERE customer_id = $1
//     ORDER BY created_at DESC
//   `;
//     const result = await pool.query(query, [customerId]);
//     return result.rows;
// };

// // 🔹 Get Total Applicants for All Customer Service Posts
// const getCustomerTotalApplicants = async (customerId) => {
//     const query = `
//     SELECT COUNT(*) AS total_applicants
//     FROM service_applications
//     WHERE service_post_id IN (
//       SELECT id FROM service_posts WHERE customer_id = $1
//     )
//   `;
//     const result = await pool.query(query, [customerId]);
//     return parseInt(result.rows[0].total_applicants, 10);
// };

// // 🔹 Get Service Posts with Applicant Count
// const getServicePostsWithApplicants = async (customerId) => {
//     const query = `
//     SELECT sp.id, sp.title, sp.service_type, COUNT(sa.id) AS applicant_count
//     FROM service_posts sp
//     LEFT JOIN service_applications sa ON sp.id = sa.service_post_id
//     WHERE sp.customer_id = $1
//     GROUP BY sp.id, sp.title, sp.service_type
//     ORDER BY sp.created_at DESC
//   `;
//     const result = await pool.query(query, [customerId]);

//     return result.rows.map((row) => ({
//         id: row.id,
//         title: row.title,
//         serviceType: row.service_type,
//         applicantCount: parseInt(row.applicant_count, 10),
//     }));
// };

// // 🔹 Get Service Posts with Full Applicant Details
// const getServicePostsWithApplicantDetails = async (customerId) => {
//     const query = `
//     SELECT
//       sp.id AS service_post_id,
//       sp.title,
//       sp.service_type,
//       sp.description,
//       sp.budget_range,
//       sp.required_skills,
//       sp.deadline,
//       sp.contact_info,
//       sp.created_at AS service_posted_date,
//       sp.updated_at AS service_updated_date,

//       d.first_name,
//       d.last_name,
//       d.email,
//       d.gender,
//       d.date_of_birth,
//       d.phone_number,
//       d.country,
//       d.city,
//       d.address,
//       d.brief_bio,
//       d.skills,
//       d.current_track,
//       d.track_level,
//       d.previous_job,
//       d.type_of_job,
//       d.years_of_experience,
//       d.expected_salary,
//       d.interested_courses,
//       d.profile_picture,
//       d.created_at AS developer_created_at,
//       d.updated_at AS developer_updated_at,
//       d.uploaded_cv,

//       sa.status AS application_status,
//       sa.created_at AS application_date,
//       sa.uploaded_cv AS applicant_cv

//     FROM service_posts sp
//     LEFT JOIN service_applications sa ON sp.id = sa.service_post_id
//     LEFT JOIN developers d ON sa.developer_id = d.id
//     WHERE sp.customer_id = $1
//     ORDER BY sp.created_at DESC
//   `;

//     const result = await pool.query(query, [customerId]);

//     const grouped = {};

//     for (const row of result.rows) {
//         const postId = row.service_post_id;

//         if (!grouped[postId]) {
//             grouped[postId] = {
//                 id: postId,
//                 title: row.title,
//                 serviceType: row.service_type,
//                 description: row.description,
//                 budget_range: row.budget_range,
//                 required_skills: row.required_skills,
//                 deadline: row.deadline,
//                 contact_info: row.contact_info,
//                 postedDate: row.service_posted_date,
//                 updatedDate: row.service_updated_date,
//                 applicants: [],
//             };
//         }

//         if (row.email) {
//             grouped[postId].applicants.push({
//                 // Personal Info
//                 firstName: row.first_name,
//                 lastName: row.last_name,
//                 email: row.email,
//                 gender: row.gender,
//                 dateOfBirth: row.date_of_birth,
//                 phoneNumber: row.phone_number,

//                 // Location
//                 country: row.country,
//                 city: row.city,
//                 address: row.address,

//                 // Professional
//                 briefBio: row.brief_bio,
//                 skills: row.skills,
//                 currentTrack: row.current_track,
//                 trackLevel: row.track_level,
//                 previousJob: row.previous_job,
//                 typeOfJob: row.type_of_job,
//                 yearsOfExperience: row.years_of_experience,
//                 expectedSalary: row.expected_salary,
//                 interestedCourses: row.interested_courses,

//                 // Application Info
//                 applicationStatus: row.application_status,
//                 applicationDate: row.application_date,
//                 applicantCv: row.applicant_cv,
//                 applicantCvLink: row.applicant_cv
//                     ? `${BASE_URL}/${row.applicant_cv.replace(/^\/+/, "")}`
//                     : null,

//                 // Files
//                 profilePicture: row.profile_picture,
//                 uploadedCv: row.uploaded_cv,
//                 generatedCv: row.generated_cv,
//                 uploadedCvLink: row.uploaded_cv
//                     ? `${BASE_URL}/${row.uploaded_cv.replace(/^\/+/, "")}`
//                     : null,

//                 // Timestamps
//                 createdAt: row.developer_created_at,
//                 updatedAt: row.developer_updated_at,
//             });
//         }
//     }

//     return Object.values(grouped);
// };

// 🔹 Delete Service Post
const deleteServicePost = async (customerId, servicePostId) => {
    const checkQuery = `SELECT id FROM service_posts WHERE id = $1 AND customer_id = $2`;
    const check = await pool.query(checkQuery, [servicePostId, customerId]);

    if (check.rows.length === 0)
        throw new Error("Service post not found or unauthorized");

    const deleteQuery = `DELETE FROM service_posts WHERE id = $1`;
    await pool.query(deleteQuery, [servicePostId]);
};

const updateCustomerProfile = async (customerId, data) => {
    const allowedFields = [
        "name",
        "brief_description",
        "contact_email",
        "phone_number",
        "profile_picture",
    ];

    const safeReturnFields = `
        id, name, email, brief_description,
        contact_email, phone_number, role, profile_picture
    `;

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
        UPDATE customers
        SET ${fieldsToUpdate.join(", ")}
        WHERE id = $${index}
        RETURNING ${safeReturnFields};
    `;

    values.push(customerId);

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getCustomerInfo,
    getCustomerServicePosts,
    getCustomerTotalApplicants,
    getServicePostsWithApplicants,
    getServicePostsWithApplicantDetails,
    deleteServicePost,
    updateCustomerProfile,
};
