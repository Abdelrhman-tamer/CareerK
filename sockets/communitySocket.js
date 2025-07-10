const { pool } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const BASE_URL = process.env.BASE_URL;
const { validateChatParticipant } = require("../middleware/authChat");
const {
    triggerNotification,
} = require("../services/notification-system/notificationTrigger");

module.exports = (io, socket) => {
    // ✅ Join group room
    socket.on("community:join", async ({ chatRoomId, userId }) => {
        try {
            socket.join(chatRoomId);
            console.log(`🟢 ${userId} joined room ${chatRoomId}`);
            socket.to(chatRoomId).emit("community:user-joined", { userId });
        } catch (error) {
            console.error("Socket error [community:join]:", error);
        }
    });

    // ✅ Leave room
    socket.on("community:leave", ({ chatRoomId, userId }) => {
        socket.leave(chatRoomId);
        console.log(`🔴 ${userId} left room ${chatRoomId}`);
        socket.to(chatRoomId).emit("community:user-left", { userId });
    });

    // ✅ Typing indicator
    socket.on("community:typing", ({ chatRoomId, userId }) => {
        socket.to(chatRoomId).emit("community:typing", { userId });
    });

    // ✅ Send message (text, image, video, file, audio)
    socket.on("community:send-message", async (data) => {
        const {
            chatRoomId,
            senderId,
            senderRole,
            message,
            fileName,
            messageType,
        } = data;

        try {
            const isValid = await validateChatParticipant(chatRoomId, senderId);
            if (!isValid) {
                return socket.emit("community:error", {
                    message: "Not authorized for this group",
                });
            }

            const messageId = uuidv4();
            const timestamp = new Date();

            await pool.query(
                `INSERT INTO chat_messages (
                    id, chat_room_id, sender_id, sender_role,
                    message, file_url, message_type, timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    messageId,
                    chatRoomId,
                    senderId,
                    senderRole,
                    message || null,
                    fileName || null,
                    messageType,
                    timestamp,
                ]
            );

            await pool.query(
                `UPDATE chat_participants
                 SET updated_at = CURRENT_TIMESTAMP
                 WHERE chat_room_id = $1 AND user_id = $2`,
                [chatRoomId, senderId]
            );

            let senderName = null;
            let senderImage = null;

            if (senderRole === "developer") {
                const res = await pool.query(
                    `SELECT first_name, last_name, profile_picture FROM developers WHERE id = $1`,
                    [senderId]
                );
                if (res.rows[0]) {
                    const dev = res.rows[0];
                    senderName = `${dev.first_name} ${dev.last_name}`;
                    senderImage = dev.profile_picture
                        ? `${BASE_URL}/uploads/profile_pictures/${dev.profile_picture}`
                        : null;
                }
            } else if (senderRole === "customer") {
                const res = await pool.query(
                    `SELECT name, profile_picture FROM customers WHERE id = $1`,
                    [senderId]
                );
                if (res.rows[0]) {
                    const c = res.rows[0];
                    senderName = c.name;
                    senderImage = c.profile_picture
                        ? `${BASE_URL}/uploads/profile_pictures/${c.profile_picture}`
                        : null;
                }
            } else if (senderRole === "company") {
                const res = await pool.query(
                    `SELECT company_name, profile_picture FROM companies WHERE id = $1`,
                    [senderId]
                );
                if (res.rows[0]) {
                    const comp = res.rows[0];
                    senderName = comp.company_name;
                    senderImage = comp.profile_picture
                        ? `${BASE_URL}/uploads/profile_pictures/${comp.profile_picture}`
                        : null;
                }
            }

            const responseMessage = {
                id: messageId,
                chatRoomId,
                senderId,
                senderRole,
                senderName,
                senderImage,
                message,
                file: fileName
                    ? `${BASE_URL}/uploads/chat_files/${fileName}`
                    : null,
                messageType,
                timestamp,
            };

            io.to(chatRoomId).emit(
                "community:receive-message",
                responseMessage
            );

            const groupRes = await pool.query(
                `SELECT name FROM chat_rooms WHERE id = $1`,
                [chatRoomId]
            );
            const groupName = groupRes.rows[0]?.name || "a community group";

            const participantsRes = await pool.query(
                `SELECT user_id, user_role FROM chat_participants
                 WHERE chat_room_id = $1 AND user_id != $2`,
                [chatRoomId, senderId]
            );

            for (const p of participantsRes.rows) {
                await triggerNotification({
                    recipientId: p.user_id,
                    recipientType: p.user_role,
                    senderId,
                    senderType: senderRole,
                    title: "New Group Message",
                    message: `${senderName} sent a new message in ${groupName}`,
                    type: "community_message",
                    metadata: { chatRoomId },
                });

                io.to(p.user_id).emit("community:new-notification", {
                    chatRoomId,
                    groupName,
                    from: senderName,
                });
            }
        } catch (error) {
            console.error("Socket error [community:send-message]:", error);
            socket.emit("community:error", {
                message: "Failed to send message",
            });
        }
    });
};

// // sockets/communitySocket.js
// const { pool } = require("../config/db");
// const { v4: uuidv4 } = require("uuid");
// const path = require("path");
// const BASE_URL = process.env.BASE_URL;
// const { validateChatParticipant } = require("../middleware/authChat");

// module.exports = (io, socket) => {
//     // ✅ Join group room
//     socket.on("community:join", async ({ chatRoomId, userId }) => {
//         try {
//             socket.join(chatRoomId);
//             console.log(`🟢 ${userId} joined room ${chatRoomId}`);
//             socket.to(chatRoomId).emit("community:user-joined", { userId });
//         } catch (error) {
//             console.error("Socket error [community:join]:", error);
//         }
//     });

//     // ✅ Leave room
//     socket.on("community:leave", ({ chatRoomId, userId }) => {
//         socket.leave(chatRoomId);
//         console.log(`🔴 ${userId} left room ${chatRoomId}`);
//         socket.to(chatRoomId).emit("community:user-left", { userId });
//     });

//     // ✅ Typing indicator
//     socket.on("community:typing", ({ chatRoomId, userId }) => {
//         socket.to(chatRoomId).emit("community:typing", { userId });
//     });

//     // ✅ Send message (text, image, video, file, audio)
//     socket.on("community:send-message", async (data) => {
//         const {
//             chatRoomId,
//             senderId,
//             senderRole,
//             message,
//             fileName,
//             messageType, // 'text', 'image', 'file', 'audio', 'video'
//         } = data;

//         try {
//             // ✅ Validate group membership
//             const isValid = await validateChatParticipant(chatRoomId, senderId);
//             if (!isValid) {
//                 return socket.emit("community:error", {
//                     message: "Not authorized for this group",
//                 });
//             }

//             const messageId = uuidv4();
//             const timestamp = new Date();

//             // ✅ Insert message
//             await pool.query(
//                 `
//             INSERT INTO chat_messages (
//                 id, chat_room_id, sender_id, sender_role,
//                 message, file_url, message_type, timestamp
//             )
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//             `,
//                 [
//                     messageId,
//                     chatRoomId,
//                     senderId,
//                     senderRole,
//                     message || null,
//                     fileName || null,
//                     messageType,
//                     timestamp,
//                 ]
//             );

//             // ✅ Update chat_participant activity
//             await pool.query(
//                 `
//             UPDATE chat_participants
//             SET updated_at = CURRENT_TIMESTAMP
//             WHERE chat_room_id = $1 AND user_id = $2
//             `,
//                 [chatRoomId, senderId]
//             );

//             // ✅ Resolve sender name and image
//             let senderName = null;
//             let senderImage = null;

//             if (senderRole === "developer") {
//                 const devRes = await pool.query(
//                     `SELECT first_name, last_name, profile_picture FROM developers WHERE id = $1`,
//                     [senderId]
//                 );
//                 if (devRes.rows[0]) {
//                     const dev = devRes.rows[0];
//                     senderName = `${dev.first_name} ${dev.last_name}`;
//                     senderImage = dev.profile_picture
//                         ? `${BASE_URL}/uploads/profile/${dev.profile_picture}`
//                         : null;
//                 }
//             } else if (senderRole === "customer") {
//                 const custRes = await pool.query(
//                     `SELECT name, profile_picture FROM customers WHERE id = $1`,
//                     [senderId]
//                 );
//                 if (custRes.rows[0]) {
//                     const c = custRes.rows[0];
//                     senderName = c.name;
//                     senderImage = c.profile_picture
//                         ? `${BASE_URL}/uploads/profile/${c.profile_picture}`
//                         : null;
//                 }
//             } else if (senderRole === "company") {
//                 const compRes = await pool.query(
//                     `SELECT company_name, profile_picture FROM companies WHERE id = $1`,
//                     [senderId]
//                 );
//                 if (compRes.rows[0]) {
//                     const comp = compRes.rows[0];
//                     senderName = comp.company_name;
//                     senderImage = comp.profile_picture
//                         ? `${BASE_URL}/uploads/profile/${comp.profile_picture}`
//                         : null;
//                 }
//             }

//             // ✅ Build message object with full sender info
//             const responseMessage = {
//                 id: messageId,
//                 chatRoomId,
//                 senderId,
//                 senderRole,
//                 senderName,
//                 senderImage,
//                 message,
//                 file: fileName
//                     ? `${BASE_URL}/uploads/group-media/${fileName}`
//                     : null,
//                 messageType,
//                 timestamp,
//             };

//             // ✅ Emit to group
//             io.to(chatRoomId).emit(
//                 "community:receive-message",
//                 responseMessage
//             );
//         } catch (error) {
//             console.error("Socket error [community:send-message]:", error);
//             socket.emit("community:error", {
//                 message: "Failed to send message",
//             });
//         }
//     });
// };
