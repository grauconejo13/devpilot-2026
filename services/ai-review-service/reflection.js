import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function reflectOnReview(studentCode, review, retrievedDocs = []) {
  const prompt = `
You are a strict code review validator.

You are given:
1. Student code
2. AI-generated review
3. Retrieved reference documents

Your job:
- Detect hallucinations (issues not supported by docs or code)
- Remove weak or irrelevant issues
- Validate suggestions
- Adjust confidence score (0–1)

Return STRICT JSON only:

{
  "validIssues": [
    {
      "message": "string",
      "severity": "low | medium | high",
      "valid": true
    }
  ],
  "removedIssues": [
    {
      "message": "string",
      "reason": "string"
    }
  ],
  "confidence": number,
  "finalScore": number,
  "notes": "string"
}

---

STUDENT CODE:
${studentCode}

---

AI REVIEW:
${JSON.stringify(review, null, 2)}

---

REFERENCE DOCUMENTS:
${JSON.stringify(retrievedDocs.map(d => d.text), null, 2)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a strict and skeptical AI reviewer.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  return JSON.parse(response.choices[0].message.content);
}
