const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../../middleware/authMiddleware"); // For protecting the route
const company_info = require("../../controllers/Profiles/company");
const upload = require("../../middleware/upload");

router.get("/profile/", authenticateUser, company_info.fetchCompanyInfo);

router.get("/job-posts", authenticateUser, company_info.fetchCompanyJobPosts);

router.get(
    "/applicants",
    authenticateUser,
    company_info.fetchCompanyTotalApplicants
);

// gets job posts with number of applicants for every post
router.get(
    "/job-posts-with-applicants",
    authenticateUser,
    company_info.fetchCompanyJobPostsWithApplicants
);

router.get(
    "/job-posts-with-applicant-details",
    authenticateUser,
    company_info.fetchCompanyJobPostsWithApplicantDetails
);

router.delete(
    "/job-posts/:jobId",
    authenticateUser,
    company_info.deleteCompanyJobPost
);

router.patch(
    "/edit-profile",
    authenticateUser,
    upload.single("profile_picture"),
    company_info.editCompanyProfile
);

module.exports = router;
