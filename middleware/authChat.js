const { pool } = require('../config/db');

const authChat = async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId || req.body.chatRoomId;
  const senderId = req.user.id;
  const senderRole = req.user.role;

  try {
    const result = await pool.query(`
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = $1 AND user_id = $2 AND user_role = $3
    `, [chatRoomId, senderId, senderRole]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied to this chat room' });
    }

    next();
  } catch (err) {
    console.error('Chat auth error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if the user owns the message they're trying to delete
// Updated checkMessageOwnership middleware
const checkMessageOwnership = async (req, res, next) => {
  const messageId = req.params.messageId;
  const senderId = req.user.id;
  const senderRole = req.user.role;

  try {
    // Get full message details including chat_room_id
    const result = await pool.query(`
      SELECT id, chat_room_id, sender_id, sender_role 
      FROM chat_messages
      WHERE id = $1
    `, [messageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const message = result.rows[0];
    
    // Verify ownership
    if (message.sender_id !== senderId || message.sender_role !== senderRole) {
      return res.status(403).json({ message: 'You do not have permission to delete this message' });
    }

    // Attach full message to request
    req.message = message;
    next();
  } catch (err) {
    console.error('Message ownership check error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// const checkMessageOwnership = async (req, res, next) => {
//   const messageId = req.params.messageId;
//   const senderId = req.user.id;
//   const senderRole = req.user.role;

//   try {
//     const result = await pool.query(`
//       SELECT 1 FROM chat_messages
//       WHERE id = $1 AND sender_id = $2 AND sender_role = $3
//     `, [messageId, senderId, senderRole]);

//     if (result.rows.length === 0) {
//       return res.status(403).json({ message: 'You do not have permission to delete this message' });
//     }

//     next();
//   } catch (err) {
//     console.error('Message ownership check error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
const validateChatParticipant = async (chatRoomId, userId) => {
  const result = await pool.query(
    `SELECT id FROM chat_participants WHERE chat_room_id = $1 AND user_id = $2`,
    [chatRoomId, userId]
  );
  return result.rows.length > 0;
};



module.exports = {authChat, checkMessageOwnership, validateChatParticipant};
