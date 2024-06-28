// src/config/database.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = 'your_database_name'; // Replace with your actual database name

let client;
let db;

async function connectToDatabase() {
  if (db) return db;

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log("Successfully connected to MongoDB!");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };