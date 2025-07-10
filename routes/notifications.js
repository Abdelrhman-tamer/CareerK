const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification-system/notifications');
const { authenticateUser } = require('../middleware/authMiddleware');
const normalizeUserContext = require('../middleware/normalizeUserContext');

// Middleware: Auth + Normalize context
router.use(authenticateUser);
router.use(normalizeUserContext);

// 🔹 Get all notifications for logged-in user
router.get('/', notificationController.getAllNotifications);

// 🔹 Get unread count (for badge UI)
router.get('/unread-count', notificationController.getUnreadCount);

// 🔹 Mark a specific notification as read
router.patch('/:id/read', notificationController.markNotificationAsRead);

// 🔹 Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
