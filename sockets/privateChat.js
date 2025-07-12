const { sendMessage } = require("../services/chats-feature/privateChat");

function privateChatHandler(io, socket) {
    socket.on("private:send_message", async (data) => {
        const {
            chatRoomId,
            message,
            senderId,
            senderType,
            mediaUrl,
            mediaType,
        } = data;

        try {
            const savedMessage = await sendMessage({
                chatRoomId,
                senderId,
                senderRole: senderType,
                message,
                fileUrl: mediaUrl || null,
                fileType: mediaType || null,
            });

            io.to(chatRoomId).emit("private:receive-message", savedMessage);
        } catch (err) {
            console.error(`❌ Private chat error:`, err);
            socket.emit("error_message", "Message failed. Try again.");
        }
    });
}

module.exports = privateChatHandler;

// const { sendMessage } = require("../services/chats-feature/privateChat");

// function privateChatHandler(io, socket) {
//     socket.on("private:send_message", async (data) => {
//         const {
//             chatRoomId,
//             message,
//             senderId,
//             senderType,
//             messageType,
//             mediaUrl,
//             mediaType,
//         } = data;

//         try {
//             const savedMessage = await sendMessage({
//                 chatRoomId,
//                 senderId,
//                 senderRole: senderType,
//                 message,
//                 fileUrl: mediaUrl || null,
//                 fileType: mediaType || null,
//             });

//             io.to(chatRoomId).emit("private:receive-message", savedMessage);
//         } catch (err) {
//             console.error(`❌ Private chat error:`, err);
//             socket.emit("error_message", "Message failed. Try again.");
//         }
//     });
// }

// module.exports = privateChatHandler;
