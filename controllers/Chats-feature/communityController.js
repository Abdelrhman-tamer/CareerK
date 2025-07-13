// controllers/communityController.js
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../../config/db");
const BASE_URL = process.env.BASE_URL;
const { validateChatParticipant } = require("../../middleware/authChat");
const communityService = require("../../services/chats-feature/communityService");
const path = require("path");
const { getMessageType } = require("../../utils/chat-mimetypes");
const {
    triggerNotification,
} = require("../../services/notification-system/notificationTrigger");

// ✅ Get all community groups
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await communityService.fetchAllGroups();
        res.status(200).json({
            success: true,
            groups: groups.map((group) => ({
                ...group,
                member_count: parseInt(group.member_count),
            })),
        });
    } catch (error) {
        console.error("Error in getAllGroups:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get single group details
exports.getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await communityService.fetchGroupById(groupId);
        if (!group) {
            return res
                .status(404)
                .json({ success: false, message: "Group not found" });
        }
        res.status(200).json({
            success: true,
            group: {
                ...group,
                member_count: parseInt(group.member_count),
            },
        });
    } catch (error) {
        console.error("Error in getGroupById:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get groups by interest tag
exports.getGroupsByTag = async (req, res) => {
    const { tag } = req.params;
    try {
        const groups = await communityService.fetchGroupsByInterestTag(tag);
        res.status(200).json({
            success: true,
            groups: groups.map((group) => ({
                ...group,
                member_count: parseInt(group.member_count),
            })),
        });
    } catch (error) {
        console.error("Error fetching groups by tag:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const tags = await communityService.getAllInterestTags();
        res.status(200).json(tags);
    } catch (error) {
        console.error("Error fetching interest tags:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Search community groups
exports.searchGroups = async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return res
            .status(400)
            .json({ success: false, message: "Search query is required" });
    }

    try {
        const groups = await communityService.searchCommunityGroups(q.trim());
        res.status(200).json({
            success: true,
            groups: groups.map((group) => ({
                ...group,
                member_count: parseInt(group.member_count),
                name_score: parseFloat(group.name_score),
                tag_score: parseFloat(group.tag_score),
            })),
        });
    } catch (error) {
        console.error("Error searching community groups:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// // ✅ Get all community groups
// exports.getAllGroups = async (req, res) => {
//     try {
//         const groups = await communityService.fetchAllGroups();
//         res.status(200).json({ success: true, groups });
//     } catch (error) {
//         console.error("Error in getAllGroups:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // ✅ Get single group details
// exports.getGroupById = async (req, res) => {
//     try {
//         const { groupId } = req.params;
//         const group = await communityService.fetchGroupById(groupId);
//         if (!group) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Group not found" });
//         }
//         res.status(200).json({
//             success: true,
//             group: {
//                 ...group,
//                 member_count: parseInt(group.member_count),
//             },
//         });
//     } catch (error) {
//         console.error("Error in getGroupById:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// exports.getGroupsByTag = async (req, res) => {
//     const { tag } = req.params;
//     try {
//         const groups = await communityService.fetchGroupsByInterestTag(tag);
//         res.status(200).json({
//             success: true,
//             groups: groups.map((group) => ({
//                 ...group,
//                 member_count: parseInt(group.member_count),
//             })),
//         });
//     } catch (error) {
//         console.error("Error fetching groups by tag:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// exports.searchGroups = async (req, res) => {
//     const { q } = req.query;

//     if (!q || q.trim() === "") {
//         return res
//             .status(400)
//             .json({ success: false, message: "Search query is required" });
//     }

//     try {
//         const groups = await communityService.searchCommunityGroups(q.trim());

//         res.status(200).json({
//             success: true,
//             groups: groups.map((group) => ({
//                 ...group,
//                 member_count: parseInt(group.member_count),
//                 name_score: parseFloat(group.name_score),
//                 tag_score: parseFloat(group.tag_score),
//             })),
//         });
//     } catch (error) {
//         console.error("Error searching community groups:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// ✅ Join a group
exports.joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const joined = await communityService.joinCommunity(
            groupId,
            userId,
            userRole
        );
        if (!joined) {
            return res.status(400).json({
                success: false,
                message: "Already a member or invalid group",
            });
        }

        res.status(200).json({
            success: true,
            message: "Joined group successfully",
        });
    } catch (error) {
        console.error("Error in joinGroup:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Leave a group
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const left = await communityService.leaveCommunity(groupId, userId);
        if (!left) {
            return res.status(400).json({
                success: false,
                message: "Not a member of this group",
            });
        }

        res.status(200).json({
            success: true,
            message: "Left group successfully",
        });
    } catch (error) {
        console.error("Error in leaveGroup:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get joined groups for current user
exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await communityService.getUserGroups(userId);

        const formattedGroups = groups.map((group) => ({
            chat_room_id: group.chat_room_id,
            group_name: group.group_name,
            image_url: group.image_url,
            description: group.description,
            interest_tag: group.interest_tag,
            member_count: parseInt(group.member_count),
            last_message: group.message || null,
            last_message_type: group.message_type || null,
            last_file_url: group.file_url || null,
            last_message_time: group.timestamp,
            unread_count: parseInt(group.unread_count || 0),
        }));

        res.status(200).json({ success: true, groups: formattedGroups });
    } catch (error) {
        console.error("Error in getMyGroups:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get paginated messages for group
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5000;

        const messages = await communityService.getGroupMessages(
            groupId,
            page,
            limit
        );

        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            message: msg.message,
            file_url: msg.file_url,
            file_type: msg.file_type,
            message_type: msg.message_type,
            timestamp: msg.timestamp,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
            sender_role: msg.sender_role,
            sender_name: msg.sender_name,
            sender_image: msg.sender_image,
        }));

        res.status(200).json({
            success: true,
            messages: formattedMessages,
            pagination: {
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error in getGroupMessages:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.uploadCommunityMedia = async (req, res) => {
    try {
        const { chatRoomId, message } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        if (!req.file || req.file.fieldname !== "chat_file") {
            return res
                .status(400)
                .json({ success: false, message: "No chat_file uploaded" });
        }

        const isValid = await validateChatParticipant(chatRoomId, senderId);
        if (!isValid) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this community group",
            });
        }

        const fileName = req.file.filename;
        const messageType = getMessageType(req.file.mimetype);
        const messageId = uuidv4();
        const timestamp = new Date();

        // ✅ Insert message into DB
        await pool.query(
            `INSERT INTO chat_messages (
                id, chat_room_id, sender_id, sender_role,
                message, file_url, file_type, message_type, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                messageId,
                chatRoomId,
                senderId,
                senderRole,
                message || null,
                fileName,
                messageType,
                "file",
                timestamp,
            ]
        );

        await pool.query(
            `UPDATE chat_participants
             SET updated_at = CURRENT_TIMESTAMP
             WHERE chat_room_id = $1 AND user_id = $2`,
            [chatRoomId, senderId]
        );

        const fileUrl = `${BASE_URL}/uploads/chat_files/${fileName}`;
        const responseMessage = {
            id: messageId,
            chatRoomId,
            senderId,
            senderRole,
            message: message || null,
            file: fileUrl,
            messageType,
            timestamp,
        };

        // ✅ Emit message to group chat room
        req.io
            .to(chatRoomId)
            .emit("community:receive-message", responseMessage);

        // ✅ Fetch group name from chat_rooms
        const groupRes = await pool.query(
            `SELECT name FROM chat_rooms WHERE id = $1`,
            [chatRoomId]
        );
        const groupName = groupRes.rows[0]?.name || "a community group";

        // ✅ Resolve sender name
        let senderName = null;
        if (senderRole === "developer") {
            const devRes = await pool.query(
                `SELECT first_name, last_name FROM developers WHERE id = $1`,
                [senderId]
            );
            if (devRes.rows[0]) {
                const dev = devRes.rows[0];
                senderName = `${dev.first_name} ${dev.last_name}`;
            }
        } else if (senderRole === "customer") {
            const custRes = await pool.query(
                `SELECT name FROM customers WHERE id = $1`,
                [senderId]
            );
            if (custRes.rows[0]) {
                senderName = custRes.rows[0].name;
            }
        } else if (senderRole === "company") {
            const compRes = await pool.query(
                `SELECT company_name FROM companies WHERE id = $1`,
                [senderId]
            );
            if (compRes.rows[0]) {
                senderName = compRes.rows[0].company_name;
            }
        }

        // ✅ Notify other participants (except sender)
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
                message: `${senderName} sent a file in ${groupName}`,
                type: "community_message",
                metadata: { chatRoomId },
            });

            req.io.to(p.user_id).emit("community:new-notification", {
                chatRoomId,
                groupName,
                from: senderName || "A group member",
            });
        }

        return res.status(200).json({
            success: true,
            fileName,
            url: fileUrl,
            message: responseMessage,
        });
    } catch (error) {
        console.error("❌ Error in uploadCommunityMedia:", error);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message,
        });
    }
};
