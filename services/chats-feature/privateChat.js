const { pool } = require("../../config/db");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const BASE_URL = process.env.BASE_URL;

const {
    triggerNotification,
} = require("../notification-system/notificationTrigger");

// 🔹 Detect user role from any of the three user tables
const detectUserRole = async (userId) => {
    const tables = [
        { table: "developers", role: "developer" },
        { table: "customers", role: "customer" },
        { table: "companies", role: "company" },
    ];

    for (const { table, role } of tables) {
        const res = await pool.query(`SELECT 1 FROM ${table} WHERE id = $1`, [
            userId,
        ]);
        if (res.rowCount > 0) return role;
    }

    throw new Error("User not found in any role table");
};

// 🔹 Get name and profile picture based on user role
const cleanProfilePicture = (profilePicturePath) => {
    if (!profilePicturePath) return null;

    // If already a full URL
    if (
        profilePicturePath.startsWith("http://") ||
        profilePicturePath.startsWith("https://")
    ) {
        return profilePicturePath;
    }

    // Ensure path does not start with "uploads/profile_pictures/uploads/..."
    const cleanedPath = profilePicturePath.replace(
        /^uploads\/+profile_pictures\/+/,
        ""
    );

    return `${BASE_URL}/uploads/profile_pictures/${cleanedPath}`;
};

const getUserDetails = async (userId, role) => {
    let query = "";

    if (role === "developer") {
        query = `
            SELECT id, first_name || ' ' || last_name AS full_name, profile_picture
            FROM developers
            WHERE id = $1
        `;
    } else if (role === "customer") {
        query = `
            SELECT id, name AS full_name, profile_picture
            FROM customers
            WHERE id = $1
        `;
    } else if (role === "company") {
        query = `
            SELECT id, company_name AS full_name, profile_picture
            FROM companies
            WHERE id = $1
        `;
    } else {
        throw new Error("Invalid user role");
    }

    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) return null;

    const user = result.rows[0];

    return {
        full_name: user.full_name || "",
        profile_picture: cleanProfilePicture(user.profile_picture),
    };
};

// 🔹 Create or fetch private chat room
const createOrGetPrivateChat = async (userA, userB) => {
    const { user_id: idA, role: roleA } = userA;
    const { user_id: idB } = userB;

    // Auto-detect roleB if not explicitly provided
    const roleB = userB.role || (await detectUserRole(idB));

    const existingRoom = await pool.query(
        `
    SELECT cr.id FROM chat_rooms cr
    JOIN chat_participants p1 ON cr.id = p1.chat_room_id
    JOIN chat_participants p2 ON cr.id = p2.chat_room_id
    WHERE cr.type = 'private'
      AND p1.user_id = $1 AND p1.user_role = $2
      AND p2.user_id = $3 AND p2.user_role = $4
  `,
        [idA, roleA, idB, roleB]
    );

    if (existingRoom.rows.length > 0) {
        return { chatRoomId: existingRoom.rows[0].id, existing: true };
    }

    const chatRoomId = uuidv4();

    await pool.query(
        `INSERT INTO chat_rooms (id, type) VALUES ($1, 'private')`,
        [chatRoomId]
    );

    await pool.query(
        `
    INSERT INTO chat_participants (chat_room_id, user_id, user_role)
    VALUES 
      ($1, $2, $3),
      ($1, $4, $5)
  `,
        [chatRoomId, idA, roleA, idB, roleB]
    );

    return { chatRoomId, existing: false };
};

// 🔹 Send message (text or file)
const sendMessage = async ({
    chatRoomId,
    senderId,
    senderRole,
    message,
    file,
}) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        let fileUrl = null;
        let fileType = null;

        if (file) {
            const uploadDir = path.join(__dirname, "../../uploads/chat_files");
            if (!fs.existsSync(uploadDir))
                fs.mkdirSync(uploadDir, { recursive: true });

            const fileExt = path.extname(file.originalname);
            const filename = `${uuidv4()}${fileExt}`;
            const filePath = path.join(uploadDir, filename);

            fs.writeFileSync(filePath, file.buffer);

            fileUrl = `${process.env.BASE_URL}/uploads/chat_files/${filename}`;
            fileType = file.mimetype.startsWith("image") ? "image" : "document";
        }

        const messageId = uuidv4();
        await client.query(
            `
        INSERT INTO chat_messages (
          id, chat_room_id, sender_id, sender_role, message, file_url, file_type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `,
            [
                messageId,
                chatRoomId,
                senderId,
                senderRole,
                message,
                fileUrl,
                fileType,
            ]
        );

        // 🟡 Get sender details
        const senderDetails = await getUserDetails(senderId, senderRole);

        // 🟢 Find recipient (other participant in chat)
        const recipientRes = await client.query(
            `SELECT user_id, user_role FROM chat_participants
         WHERE chat_room_id = $1 AND user_id != $2
         LIMIT 1`,
            [chatRoomId, senderId]
        );

        if (recipientRes.rows.length > 0) {
            const recipient = recipientRes.rows[0];

            // 🔔 Trigger notification for recipient
            await triggerNotification({
                recipientId: recipient.user_id,
                recipientType: recipient.user_role,
                senderId,
                senderType: senderRole,
                title: "New Message",
                message: `You received a new message from ${
                    senderDetails?.full_name || "someone"
                }`,
                type: "chat_message",
                metadata: { chatRoomId },
            });
        }

        await client.query("COMMIT");

        return {
            id: messageId,
            chatRoomId,
            senderId,
            senderRole,
            message,
            fileUrl,
            fileType,
            messageType: fileType ? "file" : "text",
            timestamp: new Date(),
            senderName: senderDetails?.full_name || "",
            senderProfilePicture: senderDetails?.profile_picture || "",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error sending message:", error.message);
        throw error;
    } finally {
        client.release();
    }
};

// 🔹 Get user role from participants (other than sender)
const getReceiverInfo = async (chatRoomId, senderId, senderRole) => {
    const result = await pool.query(
        `
        SELECT user_id, user_role
        FROM chat_participants
        WHERE chat_room_id = $1
          AND NOT (user_id = $2 AND user_role = $3)
        LIMIT 1
        `,
        [chatRoomId, senderId, senderRole]
    );

    if (result.rows.length === 0) return null;

    const receiver = result.rows[0];
    const { user_id, user_role } = receiver;

    const receiverData = await getUserDetails(user_id, user_role);

    // Initialize defaults
    let currentTrack = "";
    let phoneNumber = "";

    if (user_role === "developer") {
        const devRes = await pool.query(
            `SELECT current_track, phone_number FROM developers WHERE id = $1`,
            [user_id]
        );
        const dev = devRes.rows[0];
        currentTrack = dev?.current_track || "";
        phoneNumber = dev?.phone_number || "";
    } else if (user_role === "customer") {
        const custRes = await pool.query(
            `SELECT phone_number FROM customers WHERE id = $1`,
            [user_id]
        );
        phoneNumber = custRes.rows[0]?.phone_number || "";
    } else if (user_role === "company") {
        const compRes = await pool.query(
            `SELECT phone_number FROM companies WHERE id = $1`,
            [user_id]
        );
        phoneNumber = compRes.rows[0]?.phone_number || "";
    }

    return {
        receiverId: user_id,
        receiverRole: user_role,
        receiverName: receiverData?.full_name || "",
        receiverProfilePicture: receiverData?.profile_picture || "",
        receiverTrack: currentTrack,
        receiverPhoneNumber: phoneNumber,
    };
};

// 🔹 Get all messages with sender and receiver details
const getMessages = async (chatRoomId, limit = 50, offset = 0) => {
    const messagesResult = await pool.query(
        `
        SELECT id, sender_id, sender_role, message, file_url, file_type, message_type, created_at AS timestamp
        FROM chat_messages
        WHERE chat_room_id = $1 AND deleted_at IS NULL
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
        `,
        [chatRoomId, limit, offset]
    );

    const messages = messagesResult.rows;

    return await Promise.all(
        messages.map(async (msg) => {
            const sender = await getUserDetails(msg.sender_id, msg.sender_role);
            const receiver = await getReceiverInfo(
                chatRoomId,
                msg.sender_id,
                msg.sender_role
            );

            return {
                ...msg,
                senderName: sender?.full_name || "",
                senderProfilePicture: sender?.profile_picture || "",

                // 🆕 Receiver fields
                receiverId: receiver?.receiverId || "",
                receiverRole: receiver?.receiverRole || "",
                receiverName: receiver?.receiverName || "",
                receiverProfilePicture: receiver?.receiverProfilePicture || "",
                receiverTrack: receiver?.receiverTrack || "",
                receiverPhoneNumber: receiver?.receiverPhoneNumber || "",
            };
        })
    );
};

// // 🔹 Get messages in a chat room
// const getMessages = async (chatRoomId, limit = 50, offset = 0) => {
//     const result = await pool.query(
//         `
//     SELECT id, sender_id, sender_role, message, file_url, file_type, message_type, created_at AS timestamp
//     FROM chat_messages
//     WHERE chat_room_id = $1 AND deleted_at IS NULL
//     ORDER BY created_at ASC
//     LIMIT $2 OFFSET $3
//   `,
//         [chatRoomId, limit, offset]
//     );

//     return await Promise.all(
//         result.rows.map(async (msg) => {
//             const user = await getUserDetails(msg.sender_id, msg.sender_role);
//             return {
//                 ...msg,
//                 senderName: user?.full_name || "",
//                 senderProfilePicture: user?.profile_picture || "",
//             };
//         })
//     );
// };

const getMyChats = async (userId, role) => {
    const result = await pool.query(
        `
        SELECT 
            cr.id AS chat_room_id,
            m.message AS last_message,
            m.created_at AS last_message_time,
            p2.user_id AS other_user_id,
            p2.user_role AS other_user_role
        FROM chat_participants p
        JOIN chat_rooms cr ON cr.id = p.chat_room_id
        JOIN chat_participants p2 
            ON cr.id = p2.chat_room_id 
            AND NOT (p2.user_id = p.user_id AND p2.user_role = p.user_role)
        LEFT JOIN LATERAL (
            SELECT message, created_at
            FROM chat_messages 
            WHERE chat_room_id = cr.id AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE p.user_id = $1 
          AND p.user_role = $2
          AND cr.type = 'private' -- 🔹 Filter only private chats
        ORDER BY p.updated_at DESC NULLS LAST
        `,
        [userId, role]
    );

    return await Promise.all(
        result.rows.map(async (chat) => {
            const user = await getUserDetails(
                chat.other_user_id,
                chat.other_user_role
            );

            return {
                chat_room_id: chat.chat_room_id,
                last_message: chat.last_message,
                last_message_time: chat.last_message_time,
                other_user_id: chat.other_user_id,
                other_user_role: chat.other_user_role,
                user_name: user?.full_name || "",
                user_profile_picture: user?.profile_picture || "",
            };
        })
    );
};

// const getMyChats = async (userId, role) => {
//     const result = await pool.query(
//         `
//         SELECT
//             cr.id AS chat_room_id,
//             m.message AS last_message,
//             m.created_at AS last_message_time,
//             p2.user_id AS other_user_id,
//             p2.user_role AS other_user_role
//         FROM chat_participants p
//         JOIN chat_rooms cr ON cr.id = p.chat_room_id
//         JOIN chat_participants p2
//             ON cr.id = p2.chat_room_id
//             AND NOT (p2.user_id = p.user_id AND p2.user_role = p.user_role)
//         LEFT JOIN LATERAL (
//             SELECT message, created_at
//             FROM chat_messages
//             WHERE chat_room_id = cr.id AND deleted_at IS NULL
//             ORDER BY created_at DESC
//             LIMIT 1
//         ) m ON true
//         WHERE p.user_id = $1 AND p.user_role = $2
//         ORDER BY p.updated_at DESC NULLS LAST
//         `,
//         [userId, role]
//     );

//     return await Promise.all(
//         result.rows.map(async (chat) => {
//             const user = await getUserDetails(
//                 chat.other_user_id,
//                 chat.other_user_role
//             );

//             return {
//                 chat_room_id: chat.chat_room_id,
//                 last_message: chat.last_message,
//                 last_message_time: chat.last_message_time,
//                 other_user_id: chat.other_user_id,
//                 other_user_role: chat.other_user_role,
//                 user_name: user?.full_name || "",
//                 user_profile_picture: user?.profile_picture || "",
//             };
//         })
//     );
// };

// 🔹 Delete specific message by sender
const deleteMessage = async (messageId, senderId, senderRole) => {
    const result = await pool.query(
        `
    DELETE FROM chat_messages
    WHERE id = $1 AND sender_id = $2 AND sender_role = $3
    RETURNING *
  `,
        [messageId, senderId, senderRole]
    );

    return result.rowCount > 0;
};

// 🔹 Leave chat (and delete room if empty)
const leaveChat = async (chatRoomId, userId, userRole) => {
    await pool.query(
        `
    DELETE FROM chat_participants 
    WHERE chat_room_id = $1 AND user_id = $2 AND user_role = $3
  `,
        [chatRoomId, userId, userRole]
    );

    const { rows } = await pool.query(
        `
    SELECT 1 FROM chat_participants WHERE chat_room_id = $1
  `,
        [chatRoomId]
    );

    if (rows.length === 0) {
        await pool.query(`DELETE FROM chat_rooms WHERE id = $1`, [chatRoomId]);
    }

    return true;
};

module.exports = {
    createOrGetPrivateChat,
    sendMessage,
    getMessages,
    getMyChats,
    deleteMessage,
    leaveChat,
};

// const { pool } = require('../../config/db');
// const { v4: uuidv4 } = require('uuid');

// // Fetch user profile details for name and profile picture
// const getUserDetails = async (userId, role) => {
//   let query = '';
//   if (role === 'developer') {
//     query = `
//       SELECT id, first_name || ' ' || last_name AS full_name, profile_picture
//       FROM developers
//       WHERE id = $1
//     `;
//   } else if (role === 'customer') {
//     query = `
//       SELECT id, name AS full_name, profile_picture
//       FROM customers
//       WHERE id = $1
//     `;
//   } else if (role === 'company') {
//     query = `
//       SELECT id, company_name AS full_name, profile_picture
//       FROM companies
//       WHERE id = $1
//     `;
//   } else {
//     throw new Error('Invalid role');
//   }

//   const result = await pool.query(query, [userId]);
//   return result.rows[0];
// };

// // Get or create a private chat room
// const createOrGetPrivateChat = async (userA, userB) => {
//   const { user_id: idA, role: roleA } = userA;
//   const { user_id: idB, role: roleB } = userB;

//   const existingRoom = await pool.query(`
//     SELECT cr.id FROM chat_rooms cr
//     JOIN chat_participants p1 ON cr.id = p1.chat_room_id
//     JOIN chat_participants p2 ON cr.id = p2.chat_room_id
//     WHERE cr.type = 'private'
//       AND p1.user_id = $1 AND p1.user_role = $2
//       AND p2.user_id = $3 AND p2.user_role = $4
//   `, [idA, roleA, idB, roleB]);

//   if (existingRoom.rows.length > 0) {
//     return { chatRoomId: existingRoom.rows[0].id, existing: true };
//   }

//   const chatRoomId = uuidv4();
//   await pool.query(`INSERT INTO chat_rooms (id, type) VALUES ($1, 'private')`, [chatRoomId]);

//   await pool.query(`
//     INSERT INTO chat_participants (chat_room_id, user_id, user_role)
//     VALUES
//       ($1, $2, $3),
//       ($1, $4, $5)
//   `, [chatRoomId, idA, roleA, idB, roleB]);

//   return { chatRoomId, existing: false };
// };

// // Send message (text or file/image)
// const sendMessage = async ({ chatRoomId, senderId, senderRole, message, fileUrl, fileType }) => {
//   const id = uuidv4();
//   await pool.query(`
//     INSERT INTO chat_messages (id, chat_room_id, sender_id, sender_role, message, file_url, file_type)
//     VALUES ($1, $2, $3, $4, $5, $6, $7)
//   `, [id, chatRoomId, senderId, senderRole, message, fileUrl, fileType]);

//   return { id, chatRoomId, senderId, senderRole, message, fileUrl, fileType };
// };

// // Fetch messages in a chat room
// const getMessages = async (chatRoomId) => {
//   const result = await pool.query(`
//     SELECT id, sender_id, sender_role, message, file_url, file_type, created_at
//     FROM chat_messages
//     WHERE chat_room_id = $1
//     ORDER BY created_at ASC
//   `, [chatRoomId]);

//   return result.rows;
// };

// // Get all private chats for a user, including profile info and last message
// const getMyChats = async (userId, role) => {
//   const result = await pool.query(`
//     SELECT cr.id AS chat_room_id,
//            m.message AS last_message,
//            m.created_at AS last_message_time,
//            p2.user_id AS other_user_id,
//            p2.user_role AS other_user_role
//     FROM chat_participants p
//     JOIN chat_rooms cr ON p.chat_room_id = cr.id
//     JOIN chat_participants p2 ON cr.id = p2.chat_room_id AND NOT (p2.user_id = p.user_id AND p2.user_role = p.user_role)
//     LEFT JOIN LATERAL (
//       SELECT message, created_at
//       FROM chat_messages
//       WHERE chat_room_id = cr.id
//       AND deleted_at IS NULL  -- Add soft-delete flag
//       ORDER BY created_at DESC
//       LIMIT 1
//     ) m ON true
//     WHERE p.user_id = $1 AND p.user_role = $2
//     ORDER BY m.created_at DESC NULLS LAST
//   `, [userId, role]);

//   const chats = await Promise.all(result.rows.map(async chat => {
//     const user = await getUserDetails(chat.other_user_id, chat.other_user_role);
//     return {
//       ...chat,
//       user_name: user?.full_name || '',
//       user_profile_picture: user?.profile_picture || ''
//     };
//   }));

//   return chats;
// };

// // Delete a specific message
// const deleteMessage = async (messageId, senderId, senderRole) => {
//   const result = await pool.query(`
//     DELETE FROM chat_messages
//     WHERE id = $1 AND sender_id = $2 AND sender_role = $3
//     RETURNING *
//   `, [messageId, senderId, senderRole]);

//   return result.rowCount > 0;
// };

// // Implement leaveChat instead of deleteChatRoom
// const leaveChat = async (chatRoomId, userId, userRole) => {
//   // Remove participant
//   await pool.query(
//     `DELETE FROM chat_participants
//      WHERE chat_room_id = $1 AND user_id = $2 AND user_role = $3`,
//     [chatRoomId, userId, userRole]
//   );

//   // Delete room if empty
//   const { rows } = await pool.query(
//     `SELECT 1 FROM chat_participants WHERE chat_room_id = $1`,
//     [chatRoomId]
//   );

//   if (rows.length === 0) {
//     await pool.query(`DELETE FROM chat_rooms WHERE id = $1`, [chatRoomId]);
//   }
//   return true;
// };

// module.exports = {
//   createOrGetPrivateChat,
//   sendMessage,
//   getMessages,
//   getMyChats,
//   deleteMessage,
//   leaveChat
// };
