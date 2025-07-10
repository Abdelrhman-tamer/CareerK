// config/socket.js
const { Server } = require('socket.io');
const privateChatHandler = require('../sockets/privateChat');
const communitySocket = require('../sockets/communitySocket');
const notificationHandler = require('../sockets/notifications');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // 🔐 change this in production
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // Bind community events
      communitySocket(io, socket);

      notificationHandler(socket, io);

      // 🧩 Initialize basic room join (e.g., for private messages)
      socket.on('join_room', (roomId) => {
        if (!roomId) {
          console.warn(`⚠️ join_room called without roomId`);
          return;
        }
        socket.join(roomId);
        console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
      });

      // 🧠 Run private chat handler (no auth needed)
      privateChatHandler(io, socket);

      // 🛡️ Run group chat handler (auth required)
      socket.on('authenticate', (user) => {
        if (!user || !user.id || !user.role) {
          console.warn(`❌ Invalid auth payload`);
          socket.emit('authError', 'Invalid authentication.');
          return;
        }

        console.log(`🔐 Authenticated ${user.role} ${user.id} on socket ${socket.id}`);
        groupChatHandler(io, socket, user); // Pass user for scoped group logic
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('❌ Socket.io not initialized');
    return io;
  }
};









// // config/socket.js

// const { pool } = require('../config/db'); // Adjust path as needed
// let io; // Store the Socket.IO instance globally within this module

// module.exports = {
//   /**
//    * Initializes Socket.IO with the given HTTP server.
//    * @param {http.Server} httpServer - The HTTP server instance created from Express.
//    * @returns {Server} - The initialized Socket.IO server.
//    */
//   init: (httpServer) => {
//     io = require('socket.io')(httpServer, {
//       cors: {
//         origin: '*', // Replace with specific frontend domain in production
//         methods: ['GET', 'POST']
//       }
//     });

//     // Setup connection listener
//     io.on('connection', (socket) => {
//       console.log(`🔌 User connected: ${socket.id}`);

//       /**
//        * 🔹 Join a chat room (private or group)
//        * Frontend should emit `join_room` with chatRoomId
//        */
//       socket.on('join_room', (roomId) => {
//         if (!roomId) {
//           console.warn(`⚠️ join_room event called without a roomId by socket ${socket.id}`);
//           return;
//         }

//         socket.join(roomId);
//         console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
//       });

//       /**
//        * 🔹 Handle sending a message to a chat room (private chat with DB insertion)
//        * Expects payload: 
//        * {
//        *   chatRoomId, message, senderId, senderType, 
//        *   messageType, mediaUrl (optional), mediaType (optional)
//        * }
//        */
//       socket.on('send_message', async (data) => {
//         const {
//           chatRoomId,
//           message,
//           senderId,
//           senderType,
//           messageType,
//           mediaUrl,
//           mediaType
//         } = data;

//         if (!chatRoomId || !message || !senderId || !senderType || !messageType) {
//           console.warn(`⚠️ Invalid message payload from ${socket.id}:`, data);
//           return;
//         }

//         try {
//           // Insert message into the database
//           const result = await pool.query(
//             `INSERT INTO chat_messages (
//               chat_room_id, sender_id, sender_role, message, 
//               message_type, file_url, file_type
//             ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//             RETURNING id, created_at`,
//             [
//               chatRoomId,
//               senderId,
//               senderType,
//               message,
//               messageType,
//               mediaUrl || null,
//               mediaType || null
//             ]
//           );

//           const savedMessage = {
//             id: result.rows[0].id,
//             chatRoomId,
//             message,
//             senderId,
//             senderType,
//             messageType,
//             mediaUrl: mediaUrl || null,
//             mediaType: mediaType || null,
//             timestamp: result.rows[0].created_at
//           };

//           // Emit to all sockets in the room
//           io.to(chatRoomId).emit('receive_message', savedMessage);

//           console.log(`📨 Message stored and sent in room ${chatRoomId} by ${senderType} ${senderId}`);
//         } catch (err) {
//           console.error(`❌ Failed to save private message to DB:`, err);
//           socket.emit('error_message', 'Message could not be sent. Please try again.');
//         }
//       });

//       /**
//        * 🔹 User disconnects
//        */
//       socket.on('disconnect', () => {
//         console.log(`❌ User disconnected: ${socket.id}`);
//       });

//       // 🔄 You can add more events like typing indicators, read receipts, etc.
//     });

//     return io;
//   },

//   /**
//    * Returns the active Socket.IO instance.
//    * @returns {Server} - The initialized Socket.IO server.
//    * @throws {Error} - If the server was not initialized before calling this.
//    */
//   getIO: () => {
//     if (!io) {
//       throw new Error('❌ Socket.io not initialized. Call init(httpServer) first.');
//     }
//     return io;
//   }
// };









// // config/socket.js

// let io; // Store the Socket.IO instance globally within this module

// module.exports = {
//   /**
//    * Initializes Socket.IO with the given HTTP server.
//    * @param {http.Server} httpServer - The HTTP server instance created from Express.
//    * @returns {Server} - The initialized Socket.IO server.
//    */
//   init: (httpServer) => {
//     io = require('socket.io')(httpServer, {
//       cors: {
//         origin: '*', // Replace '*' with frontend domain in production
//         methods: ['GET', 'POST']
//       }
//     });

//     // Setup connection listener
//     io.on('connection', (socket) => {
//       console.log(`🔌 User connected: ${socket.id}`);

//       /**
//        * Handle joining a chat room
//        * Frontend should emit `join_room` with the roomId (chatRoomId)
//        */
//       socket.on('join_room', (roomId) => {
//         if (!roomId) {
//           console.warn(`⚠️ join_room event called without a roomId by socket ${socket.id}`);
//           return;
//         }

//         socket.join(roomId);
//         console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
//       });

//       /**
//        * Handle user disconnect
//        */
//       socket.on('disconnect', () => {
//         console.log(`❌ User disconnected: ${socket.id}`);
//       });
//     });

//     return io;
//   },

//   /**
//    * Returns the active Socket.IO instance.
//    * @returns {Server} - The initialized Socket.IO server.
//    * @throws {Error} - If the server was not initialized before calling this.
//    */
//   getIO: () => {
//     if (!io) {
//       throw new Error('❌ Socket.io not initialized. Call init(httpServer) first.');
//     }
//     return io;
//   }
// };










