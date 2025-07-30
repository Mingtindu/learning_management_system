import express from "express";
import { generateGeminiResponse } from "../utils/geminiClient.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const answer = await generateGeminiResponse(prompt);
    res.json({ answer });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "AI response failed" });
  }
});

export default router;
