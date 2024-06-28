// src/controllers/webrtc.controller.js

const { v4: uuidv4 } = require('uuid');

const rooms = new Map();

exports.createRoom = (req, res) => {
  const roomId = uuidv4();
  rooms.set(roomId, { users: new Set() });
  res.json({ roomId });
};

exports.joinRoom = (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id; // Assuming you have user info in the request

  if (!rooms.has(roomId)) {
    return res.status(404).json({ message: "Room not found" });
  }

  const room = rooms.get(roomId);
  room.users.add(userId);

  res.json({ message: "Joined room successfully" });
};

exports.leaveRoom = (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id; // Assuming you have user info in the request

  if (!rooms.has(roomId)) {
    return res.status(404).json({ message: "Room not found" });
  }

  const room = rooms.get(roomId);
  room.users.delete(userId);

  if (room.users.size === 0) {
    rooms.delete(roomId);
  }

  res.json({ message: "Left room successfully" });
};