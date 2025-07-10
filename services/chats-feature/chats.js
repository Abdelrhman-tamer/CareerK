const {pool} = require('../../config/db');

exports.getAllUserChats = async (userId, userRole) => {
  const { rows: rooms } = await pool.query(`
    SELECT cr.id AS chat_room_id, cr.type, cr.created_at
    FROM chat_participants cp
    JOIN chat_rooms cr ON cp.chat_room_id = cr.id
    WHERE cp.user_id = $1 AND cp.user_role = $2
    ORDER BY cr.created_at DESC
  `, [userId, userRole]);

  const enrichedChats = await Promise.all(rooms.map(async (room) => {
    const { chat_room_id, type } = room;

    // Fetch last message
    const { rows: lastMessageRows } = await pool.query(`
      SELECT message, created_at, message_type FROM chat_messages
      WHERE chat_room_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [chat_room_id]);

    const lastMessage = lastMessageRows[0] || null;

    if (type === 'private') {
      // Get other participant info
      const { rows: participantRows } = await pool.query(`
        SELECT user_id, user_role FROM chat_participants
        WHERE chat_room_id = $1 AND NOT (user_id = $2 AND user_role = $3)
        LIMIT 1
      `, [chat_room_id, userId, userRole]);

      const other = participantRows[0];
      let profile = null;

      if (other.user_role === 'developer') {
        const dev = await pool.query(`SELECT full_name, profile_image FROM developers WHERE id = $1`, [other.user_id]);
        profile = dev.rows[0];
      } else if (other.user_role === 'customer') {
        const cust = await pool.query(`SELECT full_name, profile_image FROM customers WHERE id = $1`, [other.user_id]);
        profile = cust.rows[0];
      }

      return {
        chatRoomId: chat_room_id,
        type,
        name: profile?.full_name || 'Unknown',
        image: profile?.profile_image || null,
        lastMessage: lastMessage?.message || null,
        lastMessageType: lastMessage?.message_type || null,
        lastMessageTimestamp: lastMessage?.created_at || null,
      };
    }

    if (type === 'group') {
      // Get group name, image, participant count
      const [{ rows: groupRows }, { rows: countRows }] = await Promise.all([
        pool.query(`SELECT name, group_image FROM community_groups WHERE chat_room_id = $1`, [chat_room_id]),
        pool.query(`SELECT COUNT(*) FROM chat_participants WHERE chat_room_id = $1`, [chat_room_id])
      ]);

      const group = groupRows[0] || {};
      const count = countRows[0]?.count || 0;

      return {
        chatRoomId: chat_room_id,
        type,
        name: group.name || 'Unknown Group',
        image: group.group_image || null,
        totalParticipants: parseInt(count),
        lastMessage: lastMessage?.message || null,
        lastMessageType: lastMessage?.message_type || null,
        lastMessageTimestamp: lastMessage?.created_at || null,
      };
    }

    return null;
  }));

  return enrichedChats.filter(Boolean);
};
