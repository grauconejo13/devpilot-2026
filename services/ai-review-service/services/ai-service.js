import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { retrieveRelevantChunks } from "./retrieval.js";

dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function reviewCode(code) {
  try {
    const chunks = await retrieveRelevantChunks(code);

    const context = chunks
      .map((c) => `SOURCE: ${c.source}\n${c.text}`)
      .join("\n\n");

    const prompt = `
You are a strict code review API.

RULES:
- Output ONLY valid JSON
- No markdown
- No explanation

Return format:
{
  "issues": [],
  "suggestions": [],
  "confidence": number,
  "summary": "string",
  "citations": []
}

CONTEXT:
${context}

CODE:
${code}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;

    return JSON.parse(text);
  } catch (err) {
    console.error("AI ERROR:", err);

    return {
      issues: [],
      suggestions: [],
      confidence: 0,
      summary: "AI failed",
    };
  }
}