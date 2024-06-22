const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const secretKey = crypto.scryptSync(
  process.env.MESSAGE_ENCRYPTION_KEY,
  "salt",
  32
);
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  if (!secretKey) {
    console.warn(
      "MESSAGE_ENCRYPTION_KEY not set. Messages will not be encrypted."
    );
    return { content: text };
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decrypt = (hash) => {
  if (!secretKey || !hash || !hash.iv || !hash.content) {
    console.warn("Unable to decrypt message. Returning as is.");
    return hash.content || hash;
  }
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
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
    iv: String,
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
