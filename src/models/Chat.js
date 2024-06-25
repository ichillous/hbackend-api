const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const crypto = require('crypto');

const password = 'myPassword';
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(password, salt, 32);

console.log(key.toString('hex'));
// const algorithm = "aes-256-ctr";
// const secretKey = crypto.scryptSync(
//   process.env.MESSAGE_ENCRYPTION_KEY,
//   "salt",
//   32
// );
// const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  if (!key) {
    console.warn(
      "MESSAGE_ENCRYPTION_KEY not set. Messages will not be encrypted."
    );
    return { content: text };
  }
  const cipher = crypto.createCipheriv(password, key, salt);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    salt: salt.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decrypt = (hash) => {
  if (!key || !hash || !hash.salt || !hash.content) {
    console.warn("Unable to decrypt message. Returning as is.");
    return hash.content || hash;
  }
  const decipher = crypto.createDecipheriv(
    password,
    key,
    Buffer.from(hash.salt, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    salt: String,
    content: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  readBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now },
    },
  ],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

messageSchema.pre("save", function (next) {
  if (this.isModified("content") && typeof this.content === "string") {
    this.content = encrypt(this.content);
  }
  next();
});

messageSchema.methods.decryptContent = function () {
  return decrypt(this.content);
};

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [messageSchema],
    chatType: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
chatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Chat", chatSchema);
