const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

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

// Basic login endpoint using environment vars (for demo purposes)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.APP_USER || "admin";
  const validPass = process.env.APP_PASS || "password";

  if (username === validUser && password === validPass) {
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
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