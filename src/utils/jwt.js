const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const privateKeyPath = path.join(
  __dirname,
  "..",
  "..",
  process.env.JWT_PRIVATE_KEY_PATH
);
const publicKeyPath = path.join(
  __dirname,
  "..",
  "..",
  process.env.JWT_PUBLIC_KEY_PATH
);

let privateKey, publicKey, passphrase;

try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  passphrase = process.env.JWT_PASSPHRASE;
  console.log("Private key loaded successfully");
  console.log("Public key loaded successfully");
} catch (error) {
  console.error("Error reading JWT key files:", error);
  process.exit(1);
}

function signToken(payload) {
  try {
    return jwt.sign(payload, { key: privateKey, passphrase: passphrase }, { algorithm: 'RS256', expiresIn: '1d' });
  } catch (error) {
    console.error("Error signing token:", error);
    throw error;
  }
}


function verifyToken(token) {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}

module.exports = { signToken, verifyToken };