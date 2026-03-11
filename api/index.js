const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let lastInquiry = null;

app.get("/api/status", (req, res) => res.json({ ok: true }));

app.post("/api/inquiry", (req, res) => {
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

  // TODO: save to database, send email, etc.
  console.log("inquiry", inquiry);
  res.json({ success: true });
});

app.get("/api/last-inquiry", (req, res) => {
  res.json({ lastInquiry });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API running on", port));