const express = require('express');
const router = express.Router();

// Middlewares
const { authenticateUser } = require('../../middleware/authMiddleware');
const { authChat, checkMessageOwnership } = require('../../middleware/authChat');
const upload = require('../../middleware/upload');

// Controller
const private_chat = require('../../controllers/Chats-feature/privateChat');

// ==============================
// Private Chat Routes
// ==============================

// ✅ Get all private chats for the logged-in user
router.get('/', authenticateUser, private_chat.getMyChats);

// ✅ Start or get a private chat room with another user
router.post('/start', authenticateUser, private_chat.createOrGetPrivateChat);

// ✅ Get messages from a specific private chat room
router.get('/:chatRoomId', authenticateUser, authChat, private_chat.getMessages);

// ✅ Send a message in a private chat room (text or file)
router.post('/:chatRoomId', authenticateUser, authChat, upload.single('chat_file'), private_chat.sendMessage);

// ✅ Delete a message (only by the message sender)
router.delete('/message/:messageId', authenticateUser, checkMessageOwnership, private_chat.deleteMessage);

// ✅ Delete a private chat room
router.delete('/:chatRoomId', authenticateUser, authChat, private_chat.leaveChat);


module.exports = router;









// const express = require('express');
// const router = express.Router();
// const { authenticateUser, authorize } = require('../../middleware/authMiddleware');
// const private_chat = require('../../controllers/Chats-feature/privateChat');
// const authChat = require('../../middleware/authChat');
// const upload = require('../../middleware/upload');

// router.get('/private', authenticateUser, private_chat.getMyChats);
// router.post('/private/start', private_chat.createOrGetPrivateChat);
// router.get('/private/:chatRoomId', authChat, private_chat.getMessages);
// router.post('/private/:chatRoomId', authChat, upload.single('chat_file'), private_chat.sendMessage);

// module.exports = router;