const { pool } = require("../../config/db"); // adjust path as needed

// Create a new service post
exports.createServicePost = async (req, res) => {
    const {
        title,
        description,
        budget_range,
        service_type,
        required_skills,
        deadline,
        contact_info,
    } = req.body;

    const customer_id = req.user.id;

    // Validate required fields
    if (
        !title ||
        !description ||
        !budget_range ||
        !service_type ||
        !required_skills ||
        !deadline
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Format the deadline to YYYY-MM-DD
    const formattedDeadline = new Date(deadline).toISOString().split("T")[0]; // Convert to string format YYYY-MM-DD

    // Ensure required_skills is an array if it's a string
    const skillsArray = Array.isArray(required_skills)
        ? required_skills
        : JSON.parse(required_skills);

    try {
        const result = await pool.query(
            `INSERT INTO service_posts
          (id, customer_id, title, description, budget_range, service_type, required_skills, deadline, contact_info)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
            [
                customer_id,
                title,
                description,
                budget_range,
                service_type,
                skillsArray, // Ensure array is correctly passed
                formattedDeadline,
                contact_info,
            ]
        );

        res.status(201).json({ post: result.rows[0] });
    } catch (err) {
        console.error("Error creating service post:", err);
        res.status(500).json({ error: "Failed to create service post" });
    }
};

// Get all service posts
exports.getAllServicePosts = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM service_posts ORDER BY created_at DESC"
        );
        res.status(200).json({ posts: result.rows });
    } catch (err) {
        console.error("Error fetching service posts:", err);
        res.status(500).json({ error: "Failed to fetch service posts" });
    }
};

// Get a single service post by ID
exports.getServicePostById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
      SELECT 
        sp.*, 
        c.name AS customer_name,
        c.profile_picture AS customer_profile_picture
      FROM service_posts sp
      JOIN customers c ON sp.customer_id = c.id
      WHERE sp.id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service post not found" });
        }

        res.status(200).json({ post: result.rows[0] });
    } catch (err) {
        console.error("Error fetching service post:", err);
        res.status(500).json({ error: "Failed to fetch service post" });
    }
};

// Update a service post (customer only)
exports.updateServicePost = async (req, res) => {
    const { id } = req.params;
    const customer_id = req.user.id;
    const {
        title,
        description,
        budget_range,
        service_type,
        required_skills,
        deadline,
        contact_info,
    } = req.body;

    try {
        // Ensure the user is the post owner
        const existing = await pool.query(
            "SELECT * FROM service_posts WHERE id = $1 AND customer_id = $2",
            [id, customer_id]
        );

        if (existing.rows.length === 0) {
            return res
                .status(403)
                .json({ error: "Not authorized to update this post" });
        }

        const result = await pool.query(
            `UPDATE service_posts SET
        title = $1,
        description = $2,
        budget_range = $3,
        service_type = $4,
        required_skills = $5,
        deadline = $6,
        contact_info = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
            [
                title,
                description,
                budget_range,
                service_type,
                required_skills,
                deadline,
                contact_info,
                id,
            ]
        );

        res.status(200).json({ post: result.rows[0] });
    } catch (err) {
        console.error("Error updating service post:", err);
        res.status(500).json({ error: "Failed to update service post" });
    }
};

// Delete a service post (customer or admin)
exports.deleteServicePost = async (req, res) => {
    const { id } = req.params;
    const customer_id = req.user.id;
    const isCustomer = req.user.role === "Customer"; // adjust depending on your role setup

    try {
        const existing = await pool.query(
            "SELECT * FROM service_posts WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Service post not found" });
        }

        if (existing.rows[0].customer_id !== customer_id && !isCustomer) {
            return res
                .status(403)
                .json({ error: "Not authorized to delete this post" });
        }

        await pool.query("DELETE FROM service_posts WHERE id = $1", [id]);
        res.status(200).json({ message: "Service post deleted successfully" });
    } catch (err) {
        console.error("Error deleting service post:", err);
        res.status(500).json({ error: "Failed to delete service post" });
    }
};

exports.getRecentlyPostedServices = async (req, res) => {
    try {
        const query = `
      SELECT 
        sp.id,
        sp.title,
        sp.description,
        sp.budget_range,
        sp.service_type,
        sp.required_skills,
        sp.deadline,
        sp.created_at
      FROM service_posts sp
      WHERE sp.deadline IS NULL OR sp.deadline >= CURRENT_DATE
      ORDER BY sp.created_at DESC
      LIMIT 10
    `;

        const { rows } = await pool.query(query);

        res.json(rows);
    } catch (error) {
        console.error("❌ Error in getRecentlyPostedServices:", error.message);
        res.status(500).json({
            error: "Error fetching recently posted services",
        });
    }
};
