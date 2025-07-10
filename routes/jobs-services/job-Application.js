const express = require("express");
const router = express.Router();
const {
    applyForJob,
    getJobApplications,
    withdrawApplication,
    updateApplicationStatus,
} = require("../../controllers/jobs-services/job-Application");
const {
    authenticateUser,
    authorize,
} = require("../../middleware/authMiddleware"); // Middleware
const upload = require("../../middleware/upload");

// Apply for a job (Only developers)
router.post(
    "/apply/:jobId",
    authenticateUser,
    authorize("developer"),
    upload.single("uploaded_cv"),
    applyForJob
);

// Route to get all applications for a job (Only Company can access)
router.get("/:jobId/applications", authenticateUser, getJobApplications);

// Route to withdraw a job application
router.delete("/:application_id", authenticateUser, withdrawApplication);

// Route for companies to update job application status
router.put("/:applicationId/status", authenticateUser, updateApplicationStatus);

module.exports = router;
