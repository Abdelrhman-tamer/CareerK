const private_chat = require('../../services/chats-feature/privateChat');
const { getMessageType } = require('../../utils/chat-mimetypes');
const { getIO } = require('../../config/socket');

// 🔹 Create or get private chat (with auto role detection)
const createOrGetPrivateChat = async (req, res) => {
  try {
    const { user_id, role } = req.body.targetUser || {};

    if (!user_id) {
      return res.status(400).json({ message: 'Target user_id is required' });
    }

    const sender = {
      user_id: req.user.id,
      role: req.user.role
    };

    const target = {
      user_id,
      role // can be undefined, will be detected in service
    };

    const result = await private_chat.createOrGetPrivateChat(sender, target);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Get all chats for the logged-in user
const getMyChats = async (req, res) => {
  try {
    const chats = await private_chat.getMyChats(req.user.id, req.user.role);
    res.status(200).json({ chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Send message (text or file) in private chat
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;
    const chatRoomId = req.params.chatRoomId;

    const fileUrl = file ? `${process.env.BASE_URL}/uploads/chat_files/${file.filename}` : null;
    const fileType = file ? getMessageType(file.mimetype) : null;

    const result = await private_chat.sendMessage({
      chatRoomId,
      senderId: req.user.id,
      senderRole: req.user.role,
      message,
      fileUrl,
      fileType
    });

    req.io.to(chatRoomId).emit('new_message', result);

    res.status(201).json(result);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// 🔹 Fetch messages from a private chat
const getMessages = async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await private_chat.getMessages(chatRoomId, limit, offset);
    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Delete a message with socket broadcast
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = req.message; // Provided by middleware
    const chatRoomId = message.chat_room_id;

    const deleted = await private_chat.deleteMessage(
      messageId,
      req.user.id,
      req.user.role
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Message not found or already deleted' });
    }

    const io = req.io || getIO();
    io.to(chatRoomId).emit('message_deleted', { messageId });

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Leave chat (soft delete)
const leaveChat = async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const senderId = req.user.id;
    const senderType = req.user.role;

    await private_chat.leaveChat(chatRoomId, senderId, senderType);

    const io = req.io || getIO();
    io.to(chatRoomId).emit('user_left_chat', {
      userId: senderId,
      userRole: senderType,
      chatRoomId
    });

    res.status(200).json({ message: 'Chat deleted (user left chat)' });
  } catch (err) {
    console.error('Error leaving chat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createOrGetPrivateChat,
  getMyChats,
  sendMessage,
  getMessages,
  deleteMessage,
  leaveChat
};









// const private_chat = require('../../services/chats-feature/privateChat');
// const { getIO } = require('../../config/socket'); // for fallback in deletion routes

// // Create or get existing private chat
// const createOrGetPrivateChat = async (req, res) => {
//   try {
//     const { user_id, role } = req.body.targetUser;

//     const sender = {
//       user_id: req.user.id,
//       role: req.user.role
//     };

//     const target = {
//       user_id,
//       role
//     };

//     const result = await private_chat.createOrGetPrivateChat(sender, target);
//     res.status(200).json(result);
//   } catch (err) {
//     console.error('Error creating chat:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Get all private chats for current user (with profile info)
// const getMyChats = async (req, res) => {
//   try {
//     const chats = await private_chat.getMyChats(req.user.id, req.user.role);
//     res.status(200).json({ chats });
//   } catch (err) {
//     console.error('Error fetching chats:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Send a message in private chat (with file/image support)
// const sendMessage = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const file = req.file;
//     const chatRoomId = req.params.chatRoomId;

//     const result = await private_chat.sendMessage({
//       chatRoomId,
//       senderId: req.user.id,
//       senderRole: req.user.role,
//       message,
//       fileUrl: file ? `/uploads/chat_files/${file.filename}` : null,
//       fileType: file ? (file.mimetype.startsWith('image') ? 'image' : 'document') : null
//     });

//     // Real-time broadcast using Socket.io
//     req.io.to(chatRoomId).emit('new_message', result);

//     res.status(201).json(result);
//   } catch (err) {
//     console.error('Error sending message:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Fetch messages in a private chat
// const getMessages = async (req, res) => {
//   try {
//     const chatRoomId = req.params.chatRoomId;
//     const { limit = 50, offset = 0 } = req.query;

//     const messages = await private_chat.getMessages(chatRoomId, limit, offset);
//     res.status(200).json({ messages });
//   } catch (err) {
//     console.error('Error fetching messages:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Delete a specific message
// // Updated deleteMessage controller
// const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const message = req.message; // Now properly populated by middleware
//     const chatRoomId = message.chat_room_id;

//     // Delete with ownership verification
//     const deleted = await private_chat.deleteMessage(
//       messageId,
//       req.user.id,
//       req.user.role
//     );

//     if (!deleted) {
//       return res.status(404).json({ message: 'Message not found or already deleted' });
//     }

//     const io = req.io || getIO();
//     io.to(chatRoomId).emit('message_deleted', { messageId });

//     res.status(200).json({ message: 'Message deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting message:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



// // Delete a chat for the current user (soft-delete/leave chat)
// const leaveChat = async (req, res) => {
//   try {
//     const chatRoomId = req.params.chatRoomId;
//     const senderId = req.user.id;
//     const senderType = req.user.role;

//     await private_chat.leaveChat(chatRoomId, senderId, senderType);
//     // await private_chat.deleteChatForUser(chatRoomId, senderId, senderType);

//     const io = req.io || getIO(); // fallback
//     io.to(chatRoomId).emit('user_left_chat', {
//       userId: senderId,
//       userRole: senderType,
//       chatRoomId
//     });

//     res.status(200).json({ message: 'Chat deleted (user left chat)' });
//   } catch (err) {
//     console.error('Error deleting chat:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = {
//   createOrGetPrivateChat,
//   getMyChats,
//   sendMessage,
//   getMessages,
//   deleteMessage,
//   leaveChat
// };

