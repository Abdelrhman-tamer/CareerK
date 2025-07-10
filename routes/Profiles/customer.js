const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../../middleware/authMiddleware");
const customer_info = require("../../controllers/Profiles/customer");
const upload = require("../../middleware/upload");

// 🔹 GET /profile/customer/profile/
router.get("/profile/", authenticateUser, customer_info.fetchCustomerInfo);

// 🔹 GET /profile/customer/service-posts
router.get(
    "/service-posts",
    authenticateUser,
    customer_info.fetchCustomerServicePosts
);

// 🔹 GET /profile/customer/applicants
router.get(
    "/applicants",
    authenticateUser,
    customer_info.fetchCustomerTotalApplicants
);

// 🔹 GET /profile/customer/service-posts-with-applicants number
router.get(
    "/service-posts-with-applicants",
    authenticateUser,
    customer_info.fetchServicePostsWithApplicants
);

// 🔹 GET /profile/customer/service-posts-with-applicant-details
router.get(
    "/service-posts-with-applicant-details",
    authenticateUser,
    customer_info.fetchServicePostsWithApplicantDetails
);

// 🔹 DELETE /profile/customer/service-posts/:postId
router.delete(
    "/service-posts/:postId",
    authenticateUser,
    customer_info.deleteCustomerServicePost
);

router.patch(
    "/edit-profile",
    authenticateUser,
    upload.single("profile_picture"),
    customer_info.editCustomerProfile
);

module.exports = router;
