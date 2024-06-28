// src/controllers/chat.controller.js
const mongoose = require("mongoose");
const { Chat, Message } = require("../models/Chat");
const { createChatSchema } = require("../validations/chat.validation");

exports.createChat = async (req, res) => {
  try {
    const { error } = createChatSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { participantIds, chatType } = req.body;
    const allParticipants = [...new Set([...participantIds, req.user.userId])];

    const newChat = new Chat({
      participants: allParticipants,
      chatType,
      messages: [],
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
};


exports.createMessage = async (chatId, userId, content) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  if (!chat.participants.includes(userId)) {
    throw new Error("User is not a participant in this chat");
  }
  const newMessage = new Message({
    sender: userId,
    content: content,
  });
  chat.messages.push(newMessage);
  await chat.save();
  return chat.messages[chat.messages.length - 1];
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.userId;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'ChatId and content are required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    const newMessage = new Message({
      sender: userId,
      content: content,
    });

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    await chat.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Log the received chatId and userId
    console.log("Received chatId:", chatId);
    console.log("User ID:", req.user.userId);

    // Validate the chatId format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    // Find the chat by its ID
    const chat = await Chat.findById(chatId).catch((error) => {
      console.error("Error finding chat:", error); // Log any error that might occur
    });
    console.log("Found chat:", chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if the user is a participant in the chat
    if (!chat.participants.includes(req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { "messages.timestamp": -1 },
      populate: { path: "messages.sender", select: "name" },
    };

    // Paginate the messages
    const messages = await Chat.paginate({ _id: chatId }, options);

    // Decrypt messages
    const decryptedMessages = messages.docs[0].messages.map((msg) => ({
      ...msg.toObject(),
      content: msg.decryptContent(),
    }));

    res.status(200).json({
      ...messages,
      docs: [{ ...messages.docs[0].toObject(), messages: decryptedMessages }],
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const chats = await db.collection('chats')
      .find({ participants: req.user.userId })
      .toArray();
    
    // Here you might want to populate participant information
    // This would require additional database queries

    res.status(200).json(chats.map(chat => new Chat(chat)));
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      !message.readBy.some((read) => read.user.toString() === req.user.userId)
    ) {
      message.readBy.push({ user: req.user.userId });
      await chat.save();
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await chat.save();
      
      // Emit a 'message read' event to all users in the chat
      req.app.get('io').to(chatId).emit('message read', { messageId, userId });
    }

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
