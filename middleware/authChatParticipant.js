const { pool } = require('../config/db');
const isValidUUID = (uuid) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);


const authorizeCommunityAccess = async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId || req.body.chatRoomId;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await pool.query(
      `SELECT 1 FROM chat_participants
       WHERE chat_room_id = $1 AND user_id = $2 AND user_role = $3
       AND left_at IS NULL`,
      [chatRoomId, userId, userRole]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not a community member' });
    }

    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// for routes with :chatRoomId
const authChatParticipant = async (req, res, next) => {
  const { chatRoomId } = req.params;
  const { senderId, senderType } = req.body;

  if (!isValidUUID(chatRoomId)) {
    return res.status(400).json({ error: 'Invalid chatRoomId' });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM chat_participants
      WHERE chat_room_id = $1 AND participant_id = $2 AND participant_type = $3
    `, [chatRoomId, senderId, senderType]);

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Set user object for consistency
    req.user = { id: senderId, role: senderType };

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server error in chat auth' });
  }
};

// for routes without :chatRoomId
const authChatSimple = (req, res, next) => {
  const { senderId, senderType } = req.body;

  if (!senderId || !senderType) {
    return res.status(400).json({ error: 'Missing senderId or senderType' });
  }

  req.user = {
    id: senderId,
    role: senderType
  };

  next();
};


module.exports = {authChatParticipant, authChatSimple, authorizeCommunityAccess};
