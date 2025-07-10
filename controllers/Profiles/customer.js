const {
    getCustomerInfo,
    getCustomerServicePosts,
    getCustomerTotalApplicants,
    getServicePostsWithApplicants,
    getServicePostsWithApplicantDetails,
    deleteServicePost,
    updateCustomerProfile,
} = require("../../services/Profiles/customer");

// 🔹 GET /profile/customer/info
const fetchCustomerInfo = async (req, res) => {
    try {
        const customerId = req.user.id;
        const customer = await getCustomerInfo(customerId);
        res.status(200).json(customer);
    } catch (error) {
        console.error("Error fetching customer info:", error.message);
        res.status(500).json({ error: "Failed to fetch customer info" });
    }
};

// 🔹 GET /profile/customer/service-posts
const fetchCustomerServicePosts = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await getCustomerServicePosts(customerId); // returns { total, posts }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching service posts:", error.message);
        res.status(500).json({ error: "Failed to fetch service posts" });
    }
};

// 🔹 GET /profile/customer/applicants
const fetchCustomerTotalApplicants = async (req, res) => {
    try {
        const customerId = req.user.id;
        const totalApplicants = await getCustomerTotalApplicants(customerId);
        res.status(200).json({ totalApplicants });
    } catch (error) {
        console.error("Error fetching total applicants:", error.message);
        res.status(500).json({ error: "Failed to fetch total applicants" });
    }
};

// 🔹 GET /profile/customer/service-posts-with-applicants
const fetchServicePostsWithApplicants = async (req, res) => {
    try {
        const customerId = req.user.id;
        const posts = await getServicePostsWithApplicants(customerId);
        res.status(200).json(posts);
    } catch (error) {
        console.error(
            "Error fetching service posts with applicants:",
            error.message
        );
        res.status(500).json({
            error: "Failed to fetch service post applicant counts",
        });
    }
};

// 🔹 GET /profile/customer/service-posts-with-applicant-details
const fetchServicePostsWithApplicantDetails = async (req, res) => {
    try {
        const customerId = req.user.id;
        const posts = await getServicePostsWithApplicantDetails(customerId);
        res.status(200).json(posts);
    } catch (error) {
        console.error(
            "Error fetching service posts with applicant details:",
            error.message
        );
        res.status(500).json({
            error: "Failed to fetch detailed service applicant data",
        });
    }
};

// 🔹 DELETE /profile/customer/service-posts/:postId
const deleteCustomerServicePost = async (req, res) => {
    try {
        const customerId = req.user.id;
        const servicePostId = req.params.postId;

        await deleteServicePost(customerId, servicePostId);
        res.status(200).json({ message: "Service post deleted successfully." });
    } catch (err) {
        console.error("Error deleting service post:", err.message);
        res.status(400).json({ error: err.message });
    }
};

// 🔹 PUT /profile/customer/edit
const editCustomerProfile = async (req, res) => {
    try {
        const customerId = req.user.id;
        const bodyData = req.body;

        if (req.file) {
            const baseUrl = process.env.BASE_URL || "http://localhost:3000";
            bodyData.profile_picture = `${baseUrl}/uploads/profile_pictures/${req.file.filename}`;
        }

        const updatedCustomer = await updateCustomerProfile(
            customerId,
            bodyData
        );

        res.status(200).json({
            message: "Customer profile updated successfully",
            customer: updatedCustomer,
        });
    } catch (err) {
        console.error("Error updating customer profile:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    fetchCustomerInfo,
    fetchCustomerServicePosts,
    fetchCustomerTotalApplicants,
    fetchServicePostsWithApplicants,
    fetchServicePostsWithApplicantDetails,
    deleteCustomerServicePost,
    editCustomerProfile,
};

// const {
//     getCustomerInfo,
//     getCustomerServicePosts,
//     getCustomerTotalApplicants,
//     getServicePostsWithApplicants,
//     getServicePostsWithApplicantDetails,
//     deleteServicePost,
//     updateCustomerProfile,
// } = require("../../services/Profiles/customer");

// // 🔹 GET /profile/customer/info
// const fetchCustomerInfo = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const customer = await getCustomerInfo(customerId);
//         res.status(200).json(customer);
//     } catch (error) {
//         console.error("Error fetching customer info:", error.message);
//         res.status(500).json({ error: "Failed to fetch customer info" });
//     }
// };

// // 🔹 GET /profile/customer/service-posts
// const fetchCustomerServicePosts = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const posts = await getCustomerServicePosts(customerId);
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error("Error fetching service posts:", error.message);
//         res.status(500).json({ error: "Failed to fetch service posts" });
//     }
// };

// // 🔹 GET /profile/customer/applicants
// const fetchCustomerTotalApplicants = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const totalApplicants = await getCustomerTotalApplicants(customerId);
//         res.status(200).json({ totalApplicants });
//     } catch (error) {
//         console.error("Error fetching total applicants:", error.message);
//         res.status(500).json({ error: "Failed to fetch total applicants" });
//     }
// };

// // 🔹 GET /profile/customer/service-posts-with-applicants
// const fetchServicePostsWithApplicants = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const posts = await getServicePostsWithApplicants(customerId);
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error(
//             "Error fetching service posts with applicants:",
//             error.message
//         );
//         res.status(500).json({
//             error: "Failed to fetch service post applicant counts",
//         });
//     }
// };

// // 🔹 GET /profile/customer/service-posts-with-applicant-details
// const fetchServicePostsWithApplicantDetails = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const posts = await getServicePostsWithApplicantDetails(customerId);
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error(
//             "Error fetching service posts with applicant details:",
//             error.message
//         );
//         res.status(500).json({
//             error: "Failed to fetch detailed service applicant data",
//         });
//     }
// };

// // 🔹 DELETE /profile/customer/service-posts/:postId
// const deleteCustomerServicePost = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const servicePostId = req.params.postId;

//         await deleteServicePost(customerId, servicePostId);
//         res.status(200).json({ message: "Service post deleted successfully." });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

// const editCustomerProfile = async (req, res) => {
//     try {
//         const customerId = req.user.id;
//         const bodyData = req.body;

//         // ⬅️ If image was uploaded, store the full URL
//         if (req.file) {
//             const baseUrl = process.env.BASE_URL || "http://localhost:3000";
//             bodyData.profile_picture = `${baseUrl}/uploads/profile_pictures/${req.file.filename}`;
//         }

//         const updatedCustomer = await updateCustomerProfile(
//             customerId,
//             bodyData
//         );

//         res.status(200).json({
//             message: "Customer profile updated successfully",
//             customer: updatedCustomer,
//         });
//     } catch (err) {
//         console.error("Error updating customer profile:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// module.exports = {
//     fetchCustomerInfo,
//     fetchCustomerServicePosts,
//     fetchCustomerTotalApplicants,
//     fetchServicePostsWithApplicants,
//     fetchServicePostsWithApplicantDetails,
//     deleteCustomerServicePost,
//     editCustomerProfile,
// };
