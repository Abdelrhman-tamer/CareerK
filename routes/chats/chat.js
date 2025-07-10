const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/Chats-feature/chatMessage-private');
const groupController = require('../../controllers/Chats-feature/public-group');
const {authChatParticipant, authChatSimple} = require('../../middleware/authChatParticipant');
const upload = require('../../middleware/upload'); 
// const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: './uploads/chat',
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

/* -------------------- PRIVATE CHAT ROUTES -------------------- */

// Start or fetch a private chat (between 2 users)
router.post('/private/start', authChatSimple, chatController.startPrivateChat);

// Send a message (text/file) in private chat
router.post('/private/messages/:chatRoomId', authChatParticipant, chatController.sendMessage);
router.post('/private/messages/:chatRoomId/file', upload.single('chat_file'), authChatParticipant, chatController.sendMessage);

// Get all messages in private chat
router.get('/private/messages/:chatRoomId', authChatParticipant, chatController.getMessages);


/* -------------------- PUBLIC GROUP CHAT ROUTES -------------------- */

// Create a group (auto joins the creator)
router.post('/groups', upload.single('image'), authChatSimple, groupController.createGroup);

// Join an existing group
router.post('/groups/:chatRoomId/join', authChatParticipant, groupController.joinGroup);

// Leave a group
router.post('/groups/:chatRoomId/leave', authChatParticipant, groupController.leaveGroup);

// Get all groups this user is part of
router.get('/groups/my', authChatSimple, groupController.getMyGroups);

// Send message (text/file) in a group
router.post('/groups/messages/:chatRoomId', authChatParticipant, chatController.sendMessage);
router.post('/groups/messages/:chatRoomId/file', upload.single('chat_file'), authChatParticipant, chatController.sendMessage);

// Get all messages in a group
router.get('/groups/messages/:chatRoomId', authChatParticipant, chatController.getMessages);


module.exports = router;









// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const chatRoomController = require('../../controllers/Chats/chatRoom');
// const messageController = require('../../controllers/Chats/message');
// const participantController = require('../../controllers/Chats/chatParticipant');
// const authChat = require('../../middleware/authChat');

// const storage = multer.diskStorage({
//   destination: './uploads/chat',
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

// // Chat Rooms
// router.post('/rooms', chatRoomController.createRoom); // private/group
// router.get('/rooms/:participantId/:participantType', chatRoomController.getUserRooms);

// // Participants (for group)
// router.post('/rooms/:chatRoomId/participants', participantController.addParticipant);
// router.delete('/rooms/:chatRoomId/participants', participantController.removeParticipant); ///:participantId

// // Messages
// router.post('/messages/read', messageController.markAsRead);
// router.post('/messages/:chatRoomId', authChat, messageController.sendMessage);
// router.post('/messages/:chatRoomId/file', upload.single('file'), authChat, messageController.sendMessage);
// router.get('/messages/:chatRoomId', messageController.getMessages);

// module.exports = router;









// const express = require('express');
// const router = express.Router();
// const chatController = require('../../controllers/Chats/chat');
// const authChat = require('../../middleware/authChat');
// const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: './uploads/chat',
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

// router.post('/rooms', chatController.createRoom);

// router.post('/messages/read', chatController.markAsRead);

// router.post('/messages/:chatRoomId', authChat, chatController.sendMessage);
// router.post('/messages/:chatRoomId/file', upload.single('file'), authChat, chatController.sendMessage);

// router.get('/messages/:chatRoomId', chatController.getMessages);


// module.exports = router;

