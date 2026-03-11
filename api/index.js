const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

// Ensure data directory exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite DB (stored on disk while container is running)
const dbFile = path.join(dataDir, "database.sqlite");
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );
});

function createUser(username, password, callback) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)`,
    [username, passwordHash, createdAt],
    function (err) {
      callback(err, this && this.lastID);
    }
  );
}

function findUserByUsername(username, callback) {
  db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
}

app.use(cors());
app.use(express.json());

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmailNotification(inquiry) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toAddress = process.env.NOTIFY_TO_EMAIL;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toAddress) {
    console.warn(
      "Email not sent: missing SMTP config (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/NOTIFY_TO_EMAIL)"
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const html = `
    <h2>New TechMotors Inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone)}</p>
    <p><strong>Car:</strong> ${escapeHtml(inquiry.car)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(inquiry.message).replace(/\n/g, "<br>")}</p>
    <p><em>Received:</em> ${new Date(inquiry.receivedAt).toLocaleString()}</p>
  `;

  await transporter.sendMail({
    from: smtpUser,
    to: toAddress,
    subject: "New inquiry from TechMotors site",
    html,
  });
}

let lastInquiry = null;

app.get("/api/status", (req, res) => res.json({ ok: true }));

// Register a new user (stored in SQLite)
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  findUserByUsername(username, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (user) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }

    createUser(username, password, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, message: "User created" });
    });
  });
});

// Login endpoint validates against the SQLite user database (fallbacks to env vars for admin)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  findUserByUsername(username, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (user) {
      const matches = bcrypt.compareSync(password, user.password_hash);
      if (matches) {
        return res.json({ success: true, message: "Login successful" });
      }
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validUser = process.env.APP_USER || "admin";
    const validPass = process.env.APP_PASS || "password";

    if (username === validUser && password === validPass) {
      return res.json({ success: true, message: "Login successful" });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  });
});

app.post("/api/inquiry", async (req, res) => {
  const { name, email, phone, car, message } = req.body;
  const inquiry = {
    name,
    email,
    phone,
    car,
    message,
    receivedAt: new Date().toISOString(),
  };

  lastInquiry = inquiry;

  console.log("inquiry", inquiry);

  try {
    await sendEmailNotification(inquiry);
  } catch (err) {
    console.error("Failed to send email notification", err);
  }

  res.json({ success: true });
});

app.get("/api/last-inquiry", (req, res) => {
  res.json({ lastInquiry });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API running on", port));