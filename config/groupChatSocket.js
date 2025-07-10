// sockets/groupChat.js
const community_Chat = require('../services/chats-feature/communityChat');

function groupChatHandler(io, socket, user) {
  socket.on('joinGroupRoom', async (chatRoomId) => {
    try {
      const result = await pool.query(
        `SELECT 1 FROM chat_participants 
         WHERE chat_room_id = $1 AND user_id = $2 AND user_role = $3`,
        [chatRoomId, user.id, user.role]
      );

      if (result.rowCount === 0) {
        return socket.emit('joinError', 'You are not a member of this group.');
      }

      socket.join(chatRoomId);
      socket.emit('joinedGroupRoom', chatRoomId);
    } catch (err) {
      console.error('Join group room error:', err);
      socket.emit('joinError', 'Something went wrong.');
    }
  });

  socket.on('sendGroupMessage', async (data) => {
    const {
      chatRoomId,
      message,
      messageType = 'text',
      fileUrl = null,
      fileType = null,
    } = data;

    try {
      const savedMessage = await community_Chat.sendGroupMessage({
        chatRoomId,
        senderId: user.id,
        senderRole: user.role,
        message,
        messageType,
        fileUrl,
        fileType,
      });

      io.to(chatRoomId).emit('receiveGroupMessage', savedMessage);
    } catch (err) {
      console.error('Send group message socket error:', err.message);
      socket.emit('sendError', err.message || 'Failed to send group message');
    }
  });

  socket.on('leaveGroupRoom', (chatRoomId) => {
    socket.leave(chatRoomId);
    socket.emit('leftGroupRoom', chatRoomId);
  });
}

module.exports = groupChatHandler;
