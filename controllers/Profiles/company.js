// const company_profile = require('../../services/Profiles/company');
const {
    getCompanyInfo,
    getCompanyJobPosts,
    getCompanyTotalApplicants,
    getCompanyJobPostsWithApplicants,
    getCompanyJobPostsWithApplicantDetails,
    deleteJobPost,
    updateCompanyProfile,
} = require("../../services/Profiles/company");

// 🔹 GET /profile/company/info
const fetchCompanyInfo = async (req, res) => {
    try {
        const companyId = req.user.id;
        const company = await getCompanyInfo(companyId);
        res.status(200).json(company);
    } catch (error) {
        console.error("Error fetching company info:", error.message);
        res.status(500).json({ error: "Failed to fetch company info" });
    }
};

// 🔹 GET /profile/company/job-posts
const fetchCompanyJobPosts = async (req, res) => {
    try {
        const companyId = req.user.id;
        const jobPosts = await getCompanyJobPosts(companyId);
        res.status(200).json(jobPosts);
    } catch (error) {
        console.error("Error fetching job posts:", error.message);
        res.status(500).json({ error: "Failed to fetch job posts" });
    }
};

// 🔹 GET /profile/company/applicants
const fetchCompanyTotalApplicants = async (req, res) => {
    try {
        const companyId = req.user.id;
        const totalApplicants = await getCompanyTotalApplicants(companyId);
        res.status(200).json({ totalApplicants });
    } catch (error) {
        console.error("Error fetching total applicants:", error.message);
        res.status(500).json({ error: "Failed to fetch applicant count" });
    }
};

// 🔹 GET /profile/company/job-posts-with-applicants
const fetchCompanyJobPostsWithApplicants = async (req, res) => {
    try {
        const companyId = req.user.id;
        const jobPosts = await getCompanyJobPostsWithApplicants(companyId);
        res.status(200).json(jobPosts);
    } catch (error) {
        console.error(
            "Error fetching job posts with applicants:",
            error.message
        );
        res.status(500).json({
            error: "Failed to fetch job posts with applicants",
        });
    }
};

// 🔹 GET /profile/company/job-posts-with-applicant-details
const fetchCompanyJobPostsWithApplicantDetails = async (req, res) => {
    try {
        const companyId = req.user.id;
        const jobPosts = await getCompanyJobPostsWithApplicantDetails(
            companyId
        );
        res.status(200).json(jobPosts);
    } catch (error) {
        console.error(
            "Error fetching job posts with applicant details:",
            error.message
        );
        res.status(500).json({
            error: "Failed to fetch detailed job applicant data",
        });
    }
};

// 🔹 DELETE /profile/company/job-posts/:jobId
const deleteCompanyJobPost = async (req, res) => {
    // ✅ Renamed to avoid conflict
    try {
        const companyId = req.user.id;
        const jobId = req.params.jobId;

        await deleteJobPost(companyId, jobId); // ✅ Correctly calls the service function
        res.status(200).json({ message: "Job post deleted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const editCompanyProfile = async (req, res) => {
    try {
        const companyId = req.user.id;

        // 🟡 Clone req.body and parse any special fields
        const data = {
            ...req.body,
        };

        // 🟢 Handle social media links if sent as stringified array
        if (typeof data.social_media_links === "string") {
            try {
                data.social_media_links = JSON.parse(data.social_media_links);
            } catch (err) {
                console.warn(
                    "Invalid JSON for social_media_links:",
                    data.social_media_links
                );
                data.social_media_links = [];
            }
        }

        // 🟢 Attach profile picture URL if file was uploaded
        if (req.file) {
            data.profile_picture = `${process.env.BASE_URL}/uploads/profile_pictures/${req.file.filename}`;
        }

        const updatedCompany = await updateCompanyProfile(companyId, data);

        res.status(200).json({
            message: "Company profile updated successfully",
            company: updatedCompany,
        });
    } catch (err) {
        console.error("❌ Error updating company profile:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    editCompanyProfile,
};

module.exports = {
    fetchCompanyInfo,
    fetchCompanyJobPosts,
    fetchCompanyTotalApplicants,
    fetchCompanyJobPostsWithApplicants,
    fetchCompanyJobPostsWithApplicantDetails,
    deleteCompanyJobPost,
    editCompanyProfile,
};
