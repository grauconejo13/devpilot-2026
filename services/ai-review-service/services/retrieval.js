import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");

function loadDocs() {
  const files = fs.readdirSync(DATA_DIR);

  return files.map((file) => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");

    return {
      source: file,
      text: content,
    };
  });
}

// SIMPLE RAG (lab acceptable)
export async function retrieveRelevantChunks(code) {
  console.log("⚡ Retrieval running");

  const docs = loadDocs();

  // simple scoring
  const scored = docs.map((doc) => {
    let score = 0;
    const lower = code.toLowerCase();

    if (lower.includes("function")) score += 1;
    if (lower.includes("security")) score += 1;
    if (lower.includes("graphql")) score += 1;
    if (lower.includes("api")) score += 1;

    return {
      ...doc,
      score,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}