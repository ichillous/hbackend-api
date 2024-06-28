// src/utils/webrtc.js

const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
      console.log('New client connected');
  
      socket.on('join-webrtc-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
      });
  
      socket.on('leave-webrtc-room', (roomId, userId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-disconnected', userId);
      });
  
      socket.on('webrtc-offer', ({ offer, roomId, targetUserId }) => {
        socket.to(roomId).emit('webrtc-offer', { offer, senderId: socket.id, targetUserId });
      });
  
      socket.on('webrtc-answer', ({ answer, roomId, targetUserId }) => {
        socket.to(roomId).emit('webrtc-answer', { answer, senderId: socket.id, targetUserId });
      });
  
      socket.on('webrtc-ice-candidate', ({ candidate, roomId, targetUserId }) => {
        socket.to(roomId).emit('webrtc-ice-candidate', { candidate, senderId: socket.id, targetUserId });
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  };
  
  module.exports = setupWebRTC;