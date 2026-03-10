const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/status", (req, res) => res.json({ ok: true }));

app.post("/api/inquiry", (req, res) => {
  const { name, email, message } = req.body;
  // TODO: save to database, send email, etc.
  console.log("inquiry", { name, email, message });
  res.json({ success: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API running on", port));