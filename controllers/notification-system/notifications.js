// controllers/notificationController.js

const notification_system = require('../../services/notification-system/notifications');

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const { userId, userType } = req; // from auth middleware
    const notifications = await notification_system.getNotifications(userId, userType);
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Mark single notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await notification_system.markAsRead(id);
    if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, notification: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const { userId, userType } = req;
    const count = await notification_system.markAllAsRead(userId, userType);
    res.status(200).json({ success: true, message: `${count} notifications marked as read` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

// Admin/internal use: Create notification manually
const createNotification = async (req, res) => {
  try {
    const { recipientId, recipientType, title, message, type } = req.body;
    const notification = await notification_system.createNotification({ recipientId, recipientType, title, message, type });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
};

// 🔹 Get unread notification count (for badge/icon)
const getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req;
    const count = await notification_system.getUnreadCount(userId, userType);
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error('❌ Error getting unread count:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
};

module.exports = {
    getAllNotifications,
    markNotificationAsRead,
    markAllAsRead,
    createNotification,
    getUnreadCount
}