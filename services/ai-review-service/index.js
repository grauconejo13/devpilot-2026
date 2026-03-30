require("dotenv").config();
const express = require("express");
const { reviewCode } = require("./services/ai.service");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Review Service Running ");
});

app.post("/review", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const result = await reviewCode(code, language);

    res.json(result);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
