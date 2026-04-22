import express from "express";
import cors from "cors";
import { reviewCode } from "./services/ai-service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/review", async (req, res) => {
  const { code } = req.body;

  const result = await reviewCode(code);

  res.json(result);
});

app.listen(4003, () => {
  console.log("🚀 AI Review Service running on 4003");
});