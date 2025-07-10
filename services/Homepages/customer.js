const { pool } = require("../../config/db"); // or use your db wrapper

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

exports.getCustomerProfile = async (customerId) => {
    const result = await pool.query(
        `SELECT id, name, profile_picture FROM customers WHERE id = $1`,
        [customerId]
    );

    if (result.rows.length === 0) throw new Error("Customer not found");

    const customer = result.rows[0];

    // Convert profile_picture to full URL if it exists
    if (customer.profile_picture) {
        customer.profile_picture = `${BASE_URL}/uploads/profile_pictures/${customer.profile_picture}`;
    }

    return customer;
};

exports.getCustomerServices = async (customerId) => {
    const result = await pool.query(
        `SELECT * 
     FROM service_posts 
     WHERE customer_id = $1
     ORDER BY created_at DESC`,
        [customerId]
    );
    return result.rows;
};
