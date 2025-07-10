const chatService = require('../../services/chats-feature/chats');

exports.getMyChats = async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  try {
    const result = await chatService.getAllUserChats(userId, userRole);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
