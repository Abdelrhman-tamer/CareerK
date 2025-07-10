module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
  
      // Join room
      socket.on('joinRoom', (chatRoomId) => {
        socket.join(`room_${chatRoomId}`);
      });
  
      // Typing indicators
      socket.on('typing', ({ chatRoomId, senderType }) => {
        socket.to(`room_${chatRoomId}`).emit('typing', { senderType });
      });
  
      socket.on('stopTyping', ({ chatRoomId }) => {
        socket.to(`room_${chatRoomId}`).emit('stopTyping');
      });
  
      // Message sent
      socket.on('newMessage', (chatRoomId, message) => {
        io.to(`room_${chatRoomId}`).emit('newMessage', message);
      });
    });
  };
  