const { pool } = require("../../../config/db");

// Get all job applications by developer
const getJobApplications = async (developerId) => {
    const result = await pool.query(
        `
    SELECT 
      -- Application fields
      ja.id AS application_id,
      ja.status,
      ja.created_at AS applied_at,

      -- Job post fields
      jp.id AS job_post_id,
      jp.title AS job_title,
      jp.job_type,
      jp.location,
      jp.salary_range,
      jp.experience_required,
      jp.job_description,
      jp.responsibilities,
      jp.qualifications,
      jp.benefits,
      jp.application_deadline,
      jp.company_website,
      jp.skills,
      jp.category,
      jp.deadline_task,
      jp.company_department,
      jp.job_availability,

      -- Company fields
      c.id AS company_id,
      c.company_name,
      c.profile_picture AS company_profile_picture,
      c.industry


    FROM job_applications ja
    JOIN job_posts jp ON ja.job_id = jp.id
    JOIN companies c ON jp.company_id = c.id
    WHERE ja.developer_id = $1
    ORDER BY ja.created_at DESC
    `,
        [developerId]
    );

    return result.rows;
};

// Get all service applications by developer
// we can add customer title after service title if we want by adding in job posts database
const getServiceApplications = async (developerId) => {
    const result = await pool.query(
        `
    SELECT 
      -- Application fields
      sa.id AS application_id,
      sa.status,
      sa.submitted_at,

      -- Service Post fields
      sp.id AS service_post_id,
      sp.title,
      sp.description,
      sp.budget_range,
      sp.service_type,
      sp.required_skills,
      sp.deadline,
      sp.contact_info,
      sp.created_at AS service_created_at,
      sp.updated_at AS service_updated_at,

      -- Customer fields
      c.id AS customer_id,
      c.name AS customer_name,
      c.profile_picture AS customer_profile_picture

    FROM service_applications sa
    JOIN service_posts sp ON sa.service_post_id = sp.id
    JOIN customers c ON sp.customer_id = c.id
    WHERE sa.developer_id = $1
    ORDER BY sa.submitted_at DESC
    `,
        [developerId]
    );

    return result.rows;
};

module.exports = {
    getJobApplications,
    getServiceApplications,
};
