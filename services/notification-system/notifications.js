// services/notificationService.js

const {pool} = require('../../config/db'); // adjust based on your db connection

// 1. Create a new notification
const createNotification = async ({ recipientId, recipientType, title, message, type }) => {
  const result = await pool.query(
    `INSERT INTO notifications (id, recipient_id, recipient_type, title, message, type)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *`,
    [recipientId, recipientType, title, message, type]
  );
  return result.rows[0];
};

// 2. Get all notifications for a user
const getNotifications = async (recipientId, recipientType) => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE recipient_id = $1 AND recipient_type = $2
     ORDER BY created_at DESC`,
    [recipientId, recipientType]
  );
  return result.rows;
};

// 3. Mark a specific notification as read
const markAsRead = async (notificationId) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [notificationId]
  );
  return result.rows[0];
};

// 4. Mark all notifications as read for a user
const markAllAsRead = async (recipientId, recipientType) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE recipient_id = $1 AND recipient_type = $2 RETURNING *`,
    [recipientId, recipientType]
  );
  return result.rowCount;
};

// 5. 🔢 Get unread notification count (optional)
const getUnreadCount = async (recipientId, recipientType) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications
     WHERE recipient_id = $1 AND recipient_type = $2 AND is_read = FALSE`,
    [recipientId, recipientType.toLowerCase()]
  );
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
}