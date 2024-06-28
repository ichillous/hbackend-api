// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/Chat.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

const password = 'myPassword';
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(password, salt, 32);
const algorithm = 'aes-256-cbc';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted
  };
};

const decrypt = (hash) => {
  if (!hash || !hash.iv || !hash.content) {
    console.warn("Unable to decrypt message. Returning as is.");
    return hash.content || hash;
  }
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
  let decrypted = decipher.update(hash.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

class Message {
  constructor(messageData) {
    this._id = messageData._id || new ObjectId();
    this.sender = messageData.sender;
    this.content = messageData.content;
    this.timestamp = messageData.timestamp || new Date();
    this.readBy = messageData.readBy || [];
  }

  encryptContent() {
    if (typeof this.content === "string") {
      this.content = encrypt(this.content);
    }
  }

  decryptContent() {
    return decrypt(this.content);
  }
}

class Chat {
  constructor(chatData) {
    this._id = chatData._id;
    this.participants = chatData.participants || [];
    this.messages = (chatData.messages || []).map(m => new Message(m));
    this.chatType = chatData.chatType;
    this.lastActivity = chatData.lastActivity || new Date();
    this.createdAt = chatData.createdAt || new Date();
    this.updatedAt = chatData.updatedAt || new Date();
  }

  async save() {
    const db = await connectToDatabase();
    this.updatedAt = new Date();
    this.messages.forEach(message => message.encryptContent());
    
    if (this._id) {
      return await db.collection('chats').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('chats').insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  static async findById(id) {
    const db = await connectToDatabase();
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(id) });
    return chat ? new Chat(chat) : null;
  }

  // Add pagination method
  static async paginate(query, options) {
    const db = await connectToDatabase();
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      db.collection('chats').find(query).skip(skip).limit(limit).toArray(),
      db.collection('chats').countDocuments(query)
    ]);

    return {
      docs: results.map(chat => new Chat(chat)),
      totalDocs: totalCount,
      limit: limit,
      page: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
      hasPrevPage: page > 1,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  // Add more methods as needed
}

module.exports = { Chat, Message };