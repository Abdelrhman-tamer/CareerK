// services/communityService.js

const { pool } = require("../../config/db"); // adjust path if needed
const path = require("path");
const BASE_URL = process.env.BASE_URL;

// Helper to build full image URL
function buildImageUrl(imagePath) {
    return imagePath
        ? `${BASE_URL}/uploads/chat_files/${path.basename(imagePath)}`
        : null;
}

// ✅ Fetch all community groups
exports.fetchAllGroups = async () => {
    const result = await pool.query(`
    SELECT cg.*, cr.name AS group_name, cr.image_url,
           (SELECT COUNT(*) FROM chat_participants cp WHERE cp.chat_room_id = cg.chat_room_id) AS member_count
    FROM community_groups cg
    JOIN chat_rooms cr ON cr.id = cg.chat_room_id
    ORDER BY cr.created_at DESC
  `);

    return result.rows.map((group) => ({
        ...group,
        image_url: buildImageUrl(group.image_url),
    }));
};

// ✅ Fetch a single group by ID
exports.fetchGroupById = async (groupId) => {
    const result = await pool.query(
        `
    SELECT cg.*, cr.name AS group_name, cr.image_url,
           (SELECT COUNT(*) FROM chat_participants cp WHERE cp.chat_room_id = cg.chat_room_id) AS member_count
    FROM community_groups cg
    JOIN chat_rooms cr ON cr.id = cg.chat_room_id
    WHERE cg.chat_room_id = $1
  `,
        [groupId]
    );

    const group = result.rows[0];
    if (!group) return null;

    return {
        ...group,
        image_url: buildImageUrl(group.image_url),
    };
};

// ✅ Fetch groups by interest tag (fuzzy match)
exports.fetchGroupsByInterestTag = async (tag) => {
    const result = await pool.query(
        `
    SELECT cg.*, cr.name AS group_name, cr.image_url,
           similarity(cg.interest_tag, $1) AS sim_score,
           (SELECT COUNT(*) FROM chat_participants cp WHERE cp.chat_room_id = cg.chat_room_id) AS member_count
    FROM community_groups cg
    JOIN chat_rooms cr ON cr.id = cg.chat_room_id
    WHERE cg.interest_tag % $1
    ORDER BY sim_score DESC
    LIMIT 10;
  `,
        [tag]
    );

    return result.rows.map((group) => ({
        ...group,
        image_url: buildImageUrl(group.image_url),
    }));
};

// ✅ Get distinct interest tags
exports.getAllInterestTags = async () => {
    const result = await pool.query(`
        SELECT DISTINCT interest_tag
        FROM community_groups
        WHERE deleted_at IS NULL
        ORDER BY interest_tag;
    `);

    const tags = result.rows.map((row) => row.interest_tag);

    return { tag: tags };
};

// ✅ Search community groups
exports.searchCommunityGroups = async (keyword) => {
    const result = await pool.query(
        `
    SELECT cg.*, cr.name AS group_name, cr.image_url,
           similarity(cr.name, $1) AS name_score,
           similarity(cg.interest_tag, $1) AS tag_score,
           (SELECT COUNT(*) FROM chat_participants cp WHERE cp.chat_room_id = cg.chat_room_id) AS member_count
    FROM community_groups cg
    JOIN chat_rooms cr ON cr.id = cg.chat_room_id
    WHERE cr.name % $1 OR cg.interest_tag % $1
    ORDER BY GREATEST(similarity(cr.name, $1), similarity(cg.interest_tag, $1)) DESC
    LIMIT 20;
  `,
        [keyword]
    );

    return result.rows.map((group) => ({
        ...group,
        image_url: buildImageUrl(group.image_url),
    }));
};

// ✅ Join community group
// // 🔄 Toggle join/leave community group
// exports.toggleCommunityMembership = async (chatRoomId, userId, userRole) => {
//     const existing = await pool.query(
//         `SELECT id FROM chat_participants WHERE chat_room_id = $1 AND user_id = $2`,
//         [chatRoomId, userId]
//     );

//     if (existing.rows.length > 0) {
//         // Already joined → Leave
//         await pool.query(
//             `DELETE FROM chat_participants WHERE chat_room_id = $1 AND user_id = $2`,
//             [chatRoomId, userId]
//         );
//         return { status: "left" };
//     } else {
//         // Not joined → Join
//         await pool.query(
//             `INSERT INTO chat_participants (chat_room_id, user_id, user_role, updated_at)
//              VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
//             [chatRoomId, userId, userRole]
//         );
//         return { status: "joined" };
//     }
// };

exports.joinCommunity = async (chatRoomId, userId, userRole) => {
    const existing = await pool.query(
        `SELECT id FROM chat_participants WHERE chat_room_id = $1 AND user_id = $2`,
        [chatRoomId, userId]
    );
    if (existing.rows.length > 0) return false;

    await pool.query(
        `
      INSERT INTO chat_participants (chat_room_id, user_id, user_role, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `,
        [chatRoomId, userId, userRole]
    );

    return true;
};

// ✅ Leave community group
exports.leaveCommunity = async (chatRoomId, userId) => {
    const result = await pool.query(
        `DELETE FROM chat_participants WHERE chat_room_id = $1 AND user_id = $2`,
        [chatRoomId, userId]
    );
    return result.rowCount > 0;
};

// ✅ Get user’s joined groups
exports.getUserGroups = async (userId) => {
    const result = await pool.query(
        `
    SELECT 
      cr.id AS chat_room_id,
      cr.name AS group_name,
      cr.image_url,
      cr.description,
      cg.interest_tag,
      cg.member_count,
      cm.message,
      cm.file_url,
      cm.message_type,
      cm.timestamp,
      cm.created_at AS last_message_time,
      (
        SELECT COUNT(*) 
        FROM chat_messages m 
        WHERE m.chat_room_id = cr.id 
          AND m.timestamp > cp.updated_at
      ) AS unread_count
    FROM chat_participants cp
    JOIN chat_rooms cr ON cp.chat_room_id = cr.id
    JOIN community_groups cg ON cg.chat_room_id = cr.id
    LEFT JOIN LATERAL (
      SELECT * FROM chat_messages m 
      WHERE m.chat_room_id = cr.id 
      ORDER BY m.timestamp DESC 
      LIMIT 1
    ) cm ON true
    WHERE cp.user_id = $1
    ORDER BY cm.timestamp DESC NULLS LAST
    `,
        [userId]
    );

    return result.rows.map((row) => ({
        ...row,
        image_url: row.image_url
            ? `${BASE_URL}/uploads/chat_files/${path.basename(row.image_url)}`
            : null,
    }));
};

// ✅ Get messages for a group (paginated)
exports.getGroupMessages = async (chatRoomId, page = 1, limit = 5000) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `
    SELECT 
      cm.id,
      cm.message,
      cm.file_url,
      cm.file_type,
      cm.message_type,
      cm.timestamp,
      cm.sender_id,
      cm.sender_role,
      cm.created_at,
      CASE 
        WHEN cm.sender_role = 'developer' THEN d.first_name || ' ' || d.last_name
        WHEN cm.sender_role = 'customer' THEN c.name
        WHEN cm.sender_role = 'company' THEN comp.company_name
        ELSE 'Unknown'
      END AS sender_name,
      CASE 
        WHEN cm.sender_role = 'developer' THEN d.profile_picture
        WHEN cm.sender_role = 'customer' THEN c.profile_picture
        WHEN cm.sender_role = 'company' THEN comp.profile_picture
        ELSE null
      END AS sender_image
    FROM chat_messages cm
    LEFT JOIN developers d ON d.id = cm.sender_id AND cm.sender_role = 'developer'
    LEFT JOIN customers c ON c.id = cm.sender_id AND cm.sender_role = 'customer'
    LEFT JOIN companies comp ON comp.id = cm.sender_id AND cm.sender_role = 'company'
    WHERE cm.chat_room_id = $1
    ORDER BY cm.timestamp DESC
    LIMIT $2 OFFSET $3
    `,
        [chatRoomId, limit, offset]
    );

    return result.rows.map((msg) => ({
        ...msg,
        sender_image: msg.sender_image
            ? `${BASE_URL}/uploads/profile_pictures/${path.basename(
                  msg.sender_image
              )}`
            : null,
    }));
};
// exports.getGroupMessages = async (chatRoomId, page = 1, limit = 20) => {
//     const offset = (page - 1) * limit;

//     const result = await pool.query(
//         `
//     SELECT
//       cm.id,
//       cm.message,
//       cm.file_url,
//       cm.file_type,
//       cm.message_type,
//       cm.timestamp,
//       cm.sender_id,
//       cm.sender_role,
//       cm.created_at,
//       CASE
//         WHEN cm.sender_role = 'developer' THEN d.first_name || ' ' || d.last_name
//         WHEN cm.sender_role = 'customer' THEN c.name
//         WHEN cm.sender_role = 'company' THEN comp.company_name
//         ELSE 'Unknown'
//       END AS sender_name,
//       CASE
//         WHEN cm.sender_role = 'developer' THEN d.profile_picture
//         WHEN cm.sender_role = 'customer' THEN c.profile_picture
//         WHEN cm.sender_role = 'company' THEN comp.profile_picture
//         ELSE null
//       END AS sender_image
//     FROM chat_messages cm
//     LEFT JOIN developers d ON d.id = cm.sender_id AND cm.sender_role = 'developer'
//     LEFT JOIN customers c ON c.id = cm.sender_id AND cm.sender_role = 'customer'
//     LEFT JOIN companies comp ON comp.id = cm.sender_id AND cm.sender_role = 'company'
//     WHERE cm.chat_room_id = $1
//     ORDER BY cm.timestamp DESC
//     LIMIT $2 OFFSET $3
//   `,
//         [chatRoomId, limit, offset]
//     );

//     return result.rows;
// };
