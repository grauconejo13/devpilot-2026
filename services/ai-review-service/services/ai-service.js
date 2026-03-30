import OpenAI from "openai";
import { retrieveRelevantChunks } from "../retrieval.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function reviewCode(studentCode, language = null) {
  // 1. Retrieve relevant rules
  const chunks = await retrieveRelevantChunks(studentCode, {
    language,
    topK: 5,
  });

  // 2. Build context
  const context = chunks
    .map((c, i) => `Rule ${i + 1}: ${c.text}`)
    .join("\n");

  // 3. Prompt 
  const prompt = `
You are a strict senior code reviewer.

You MUST return ONLY valid JSON.

Do NOT include explanations outside JSON.

------------------------------------

REFERENCE RULES:
${context}

------------------------------------

STUDENT CODE:
${studentCode}

------------------------------------

Return JSON in this EXACT format:

{
  "issues": [
    {
      "message": "string",
      "severity": "low | medium | high"
    }
  ],
  "suggestions": [
    "string"
  ],
  "score": number (0-10),
  "summary": "string"
}
`;

  // 4. Call OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are a strict JSON-only API.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  let text = response.choices[0].message.content;

  // 5. JSON Parse 
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log("⚠️ JSON parse failed, raw output:");
    console.log(text);

    return {
      issues: [],
      suggestions: [],
      score: 0,
      summary: "Failed to parse AI response",
    };
  }
}
