const { pool } = require("../../config/db");
const path = require("path");
const {
    triggerNotification,
} = require("../../services/notification-system/notificationTrigger");

const BASE_URL = process.env.BASE_URL;

// 🔹 Developer applies to a service post
exports.applyToServicePost = async (req, res) => {
    const {
        service_post_id,
        name,
        phone,
        years_of_experience,
        expected_salary,
    } = req.body;

    const uploaded_cv = req.file ? `uploads/cvs/${req.file.filename}` : null;
    const developer_id = req.user.id;
    const email = req.user.email; // ✅ Auto-detect from authenticated user

    if (!uploaded_cv) {
        return res.status(400).json({ error: "CV file is required" });
    }

    // Basic validation
    if (!name || !phone || !years_of_experience || !expected_salary || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if already applied
        const existing = await pool.query(
            `SELECT 1 FROM service_applications 
             WHERE developer_id = $1 AND service_post_id = $2`,
            [developer_id, service_post_id]
        );

        if (existing.rows.length > 0) {
            return res
                .status(400)
                .json({ error: "Already applied to this service post" });
        }

        // Insert application
        const result = await pool.query(
            `INSERT INTO service_applications 
             (id, developer_id, service_post_id, name, email, phone, years_of_experience, expected_salary, uploaded_cv)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                developer_id,
                service_post_id,
                name,
                email,
                phone,
                years_of_experience,
                expected_salary,
                uploaded_cv,
            ]
        );

        const application = result.rows[0];

        // Get post info and customer
        const postQuery = await pool.query(
            `SELECT 
                sp.title, 
                sp.customer_id, 
                d.first_name || ' ' || d.last_name AS developer_name
             FROM service_posts sp
             JOIN developers d ON d.id = $1
             WHERE sp.id = $2`,
            [developer_id, service_post_id]
        );

        if (postQuery.rows.length === 0) {
            return res.status(404).json({ error: "Service post not found" });
        }

        const {
            title: serviceTitle,
            customer_id: customerId,
            developer_name: developerName,
        } = postQuery.rows[0];

        // Notify customer
        await triggerNotification({
            recipientId: customerId,
            recipientType: "customer",
            senderId: developer_id,
            senderType: "developer",
            title: "New Service Application",
            message: `${developerName} applied for your service: ${serviceTitle}`,
            type: "service_application",
        });

        res.status(201).json({ application });
    } catch (err) {
        console.error("Error applying to service post:", err);
        res.status(500).json({ error: "Failed to apply to service post" });
    }
};

// 🔹 Get applications for a service post
exports.getApplicationsForServicePost = async (req, res) => {
    const { service_post_id } = req.params;
    const user_id = req.user.id;

    try {
        // Verify service post ownership
        const post = await pool.query(
            "SELECT * FROM service_posts WHERE id = $1",
            [service_post_id]
        );
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Service post not found" });
        }

        const servicePost = post.rows[0];

        if (servicePost.customer_id !== user_id) {
            return res.status(403).json({
                error: "Not authorized to view applications for this service post",
            });
        }

        // Fetch applications with developer info
        const result = await pool.query(
            `
            SELECT 
                sa.*, 
                d.first_name, 
                d.last_name, 
                d.email, 
                d.profile_picture
            FROM service_applications sa
            JOIN developers d ON sa.developer_id = d.id
            WHERE sa.service_post_id = $1
            ORDER BY sa.created_at DESC
            `,
            [service_post_id]
        );

        // Map response with formatted profile_picture
        const applications = result.rows.map((app) => ({
            ...app,
            profile_picture: app.profile_picture
                ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                      app.profile_picture
                  )}`
                : null,
        }));

        res.status(200).json({ applications });
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
};
// exports.getApplicationsForServicePost = async (req, res) => {
//     const { service_post_id } = req.params;
//     const user_id = req.user.id; // logged-in customer

//     try {
//         // Fetch the post and verify ownership
//         const post = await pool.query(
//             "SELECT * FROM service_posts WHERE id = $1",
//             [service_post_id]
//         );
//         if (post.rows.length === 0) {
//             return res.status(404).json({ error: "Service post not found" });
//         }

//         const servicePost = post.rows[0];

//         if (servicePost.customer_id !== user_id) {
//             return res.status(403).json({
//                 error: "Not authorized to view applications for this service post",
//             });
//         }

//         // Get all applications
//         const result = await pool.query(
//             `SELECT * FROM service_applications
//        WHERE service_post_id = $1
//        ORDER BY created_at DESC`,
//             [service_post_id]
//         );

//         res.status(200).json({ applications: result.rows });
//     } catch (err) {
//         console.error("Error fetching applications:", err);
//         res.status(500).json({ error: "Failed to fetch applications" });
//     }
// };

// 🔹 Get one application by ID
exports.getApplicationById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    try {
        // Step 1: Get the application
        const appResult = await pool.query(
            "SELECT * FROM service_applications WHERE id = $1",
            [id]
        );

        if (appResult.rows.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        const app = appResult.rows[0];

        // Step 2: Authorization check
        if (user_role === "developer" && app.developer_id !== user_id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        if (user_role === "customer") {
            const postResult = await pool.query(
                "SELECT * FROM service_posts WHERE id = $1",
                [app.service_post_id]
            );
            if (
                postResult.rows.length === 0 ||
                postResult.rows[0].customer_id !== user_id
            ) {
                return res.status(403).json({ error: "Not authorized" });
            }
        }

        // Step 3: Get developer info (now includes location)
        const devResult = await pool.query(
            `
            SELECT id, first_name, last_name, profile_picture, brief_bio,
                   country, city, address, CONCAT(
                       INITCAP(LOWER(track_level)), 
                       ' ', 
                       INITCAP(LOWER(current_track))
                   ) AS track_title
            FROM developers
            WHERE id = $1
            `,
            [app.developer_id]
        );

        let developer = null;

        if (devResult.rows.length > 0) {
            const dev = devResult.rows[0];

            developer = {
                id: dev.id,
                firstName: dev.first_name,
                lastName: dev.last_name,
                briefBio: dev.brief_bio || null,
                trackTitle: dev.track_title || null,
                profilePicture: dev.profile_picture
                    ? dev.profile_picture.startsWith("http")
                        ? dev.profile_picture
                        : `${BASE_URL}/uploads/profile_pictures/${dev.profile_picture.replace(
                              /^\/+/,
                              ""
                          )}`
                    : null,
                location: {
                    country: dev.country || null,
                    city: dev.city || null,
                    address: dev.address || null,
                },
            };
        }

        // Step 4: Format final response
        const formattedApp = {
            id: app.id,
            developerId: app.developer_id,
            servicePostId: app.service_post_id,
            submittedAt: app.submitted_at,
            createdAt: app.created_at,
            status: app.status,
            name: app.name,
            email: app.email,
            phone: app.phone,
            yearsOfExperience: app.years_of_experience,
            expectedSalary: app.expected_salary,
            uploadedCv: app.uploaded_cv,
            uploadedCvLink: app.uploaded_cv
                ? `${BASE_URL}/uploads/cvs/${app.uploaded_cv.split("/").pop()}`
                : null,
            developer,
        };

        res.status(200).json({ application: formattedApp });
    } catch (err) {
        console.error("❌ Error fetching application:", err.message);
        res.status(500).json({ error: "Failed to fetch application" });
    }
};

// 🔹 Update application status
exports.updateApplicationStatus = async (req, res) => {
    const { id } = req.params; // application ID
    const { status } = req.body;
    const user_id = req.user.id; // current logged-in customer

    // ✅ Step 1: Validate input
    if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
            error: "Invalid status value. Must be accepted or rejected.",
        });
    }

    try {
        // ✅ Step 2: Fetch application by ID
        const appResult = await pool.query(
            "SELECT * FROM service_applications WHERE id = $1",
            [id]
        );
        if (appResult.rows.length === 0) {
            console.warn(`No application found with ID ${id}`);
            return res.status(404).json({ error: "Application not found" });
        }

        const app = appResult.rows[0];

        // ✅ Step 3: Fetch related service post to check ownership
        const postResult = await pool.query(
            "SELECT * FROM service_posts WHERE id = $1",
            [app.service_post_id]
        );
        if (postResult.rows.length === 0) {
            console.warn(`No service post found for application with ID ${id}`);
            return res.status(404).json({ error: "Service post not found" });
        }

        const servicePost = postResult.rows[0];

        // ✅ Step 4: Check if current user is the owner of the post
        if (servicePost.customer_id !== user_id) {
            return res
                .status(403)
                .json({ error: "Not authorized to update this application" });
        }

        // ✅ Step 5: Update the status
        const updateResult = await pool.query(
            `UPDATE service_applications
       SET status = $1
       WHERE id = $2
       RETURNING *`,
            [status, id]
        );

        const updatedApp = updateResult.rows[0];

        // 5. 🔔 Trigger notification to developer
        const developerId = app.developer_id;
        const customerId = servicePost.customer_id;
        const serviceTitle = servicePost.title;

        if (status === "accepted") {
            await triggerNotification({
                recipientId: developerId,
                recipientType: "developer",
                senderId: customerId,
                senderType: "customer",
                title: "Service Application Accepted",
                message: `Your application for ${serviceTitle} has been accepted.`,
                type: "service_acceptance",
            });
        } else if (status === "rejected") {
            await triggerNotification({
                recipientId: developerId,
                recipientType: "developer",
                senderId: customerId,
                senderType: "customer",
                title: "Service Application Rejected",
                message: `Your application for ${serviceTitle} was rejected.`,
                type: "service_rejection",
            });
        }

        res.status(200).json({ application: updatedApp });
    } catch (err) {
        console.error("Error updating application status:", err);
        res.status(500).json({ error: "Failed to update application status" });
    }
};

// 🔹 Delete application (by developer or admin)
exports.deleteApplication = async (req, res) => {
    const { id } = req.params; // application ID
    const user_id = req.user.id; // logged-in developer

    try {
        // Check if application exists
        const result = await pool.query(
            "SELECT * FROM service_applications WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Application not found" });
        }

        const application = result.rows[0];

        // Check if this developer owns it
        if (application.developer_id !== user_id) {
            return res
                .status(403)
                .json({ error: "Not authorized to delete this application" });
        }

        // Delete it
        await pool.query("DELETE FROM service_applications WHERE id = $1", [
            id,
        ]);

        res.status(200).json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).json({ error: "Failed to delete application" });
    }
};
