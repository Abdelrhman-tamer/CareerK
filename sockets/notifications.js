// sockets/notificationSocket.js

const connectedUsers = new Map(); // Map userId_userType => socketId

module.exports = (socket, io) => {
  // 🧩 User joins the socket with their ID and type
  socket.on('join_notification_channel', ({ userId, userType }) => {
    if (!userId || !userType) return;
    const key = `${userId}_${userType}`;
    connectedUsers.set(key, socket.id);
    console.log(`✅ ${key} connected for notifications`);
  });

  // 🛑 Handle disconnect
  socket.on('disconnect', () => {
    for (const [key, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(key);
        console.log(`❌ ${key} disconnected`);
      }
    }
  });
};

// Export a helper to emit notifications from anywhere
module.exports.emitNotification = (notification) => {
  const { user_id, user_type } = notification;
  const key = `${user_id}_${user_type}`;
  const socketId = connectedUsers.get(key);
  if (socketId) {
    const { io } = require('../socket'); // dynamically require to avoid circular dependency
    io.to(socketId).emit('new_notification', notification);
    console.log(`📤 Sent notification to ${key}`);
  } else {
    console.log(`⚠️ User ${key} not connected`);
  }
};
