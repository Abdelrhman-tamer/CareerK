const {
    getJobApplications,
    getServiceApplications,
} = require("../../../services/Profiles/developerProfile/applied-jobs");

// Helper to structure job applications
const structureJobApplications = (rows) =>
    rows.map((row) => ({
        application_id: row.application_id,
        status: row.status,
        applied_at: row.applied_at,
        job_post: {
            id: row.job_post_id,
            title: row.job_title,
            job_type: row.job_type,
            location: row.location,
            salary_range: row.salary_range,
            experience_required: row.experience_required,
            job_description: row.job_description,
            responsibilities: row.responsibilities,
            qualifications: row.qualifications,
            benefits: row.benefits,
            application_deadline: row.application_deadline,
            company_website: row.company_website,
            skills: row.skills,
            category: row.category,
            deadline_task: row.deadline_task,
            company_department: row.company_department,
            job_availability: row.job_availability,
            company: {
                id: row.company_id,
                company_name: row.company_name,
                profile_picture: row.company_profile_picture,
                industry: row.industry,
            },
        },
    }));

// Helper to structure service applications
const structureServiceApplications = (rows) =>
    rows.map((row) => ({
        application_id: row.application_id,
        status: row.status,
        submitted_at: row.submitted_at,
        service_post: {
            id: row.service_post_id,
            title: row.title,
            description: row.description,
            budget_range: row.budget_range,
            service_type: row.service_type,
            required_skills: row.required_skills,
            deadline: row.deadline,
            contact_info: row.contact_info,
            created_at: row.service_created_at,
            updated_at: row.service_updated_at,
            customer: {
                id: row.customer_id,
                name: row.customer_name,
                profile_picture: row.customer_profile_picture,
            },
        },
    }));

// Controller function
const getMyApplications = async (req, res) => {
    try {
        const developerId = req.user.id;

        const [jobApps, serviceApps] = await Promise.all([
            getJobApplications(developerId),
            getServiceApplications(developerId),
        ]);

        const structuredJobApps = structureJobApplications(jobApps);
        const structuredServiceApps = structureServiceApplications(serviceApps);

        res.status(200).json({
            job_applications: structuredJobApps,
            service_applications: structuredServiceApps,
        });
    } catch (err) {
        console.error("❌ Error fetching applications:", err.message);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

module.exports = {
    getMyApplications,
};
