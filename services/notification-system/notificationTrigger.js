// services/notification-system/notificationTrigger.js

const notificationService = require('./notifications');

// 🔔 General trigger function for any event
const triggerNotification = async ({
  recipientId,
  recipientType,
  senderId,
  senderType,
  title,
  message,
  type,
}) => {
  const notificationData = {
    recipientId,
    recipientType,
    sender_id: senderId,
    sender_type: senderType,
    title,
    message,
    type,
    is_read: false,
  };

  const notification = await notificationService.createNotification(notificationData);

  return notification;
};

module.exports = { triggerNotification };
