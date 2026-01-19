const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB config
const MONGO_URL = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "myapp";

app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend
app.use(
  express.static(path.join(__dirname, "../frontend/public"))
);

let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Handle form submission
app.post("/submit", async (req, res) => {
  if (!db) {
    return res.status(503).send("Database not ready");
  }

  const { name, email } = req.body;
  await db.collection("users").insertOne({ name, email });

  res.send("Data saved successfully!");
});

// View database contents
app.get("/db/users", async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.json({
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
