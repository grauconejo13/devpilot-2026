import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone"

dotenv.config({
    path: path.resolve(process.cwd(), "../.env"),
});


// Init clients

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(
    process.env.PINECONE_INDEX || "devpilot-index"
);


// Convert student code  

async function embedText(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return res.data[0].embedding;
}


//  Main retrieval function

async function retrieveRelevantChunks(studentCode, options = {}) {
  const {
    language = null,   
    topK = 5,
  } = options;

  if (!studentCode || studentCode.trim() === "") {
    return [];
  }

  console.log("Embedding input...");
  const queryEmbedding = await embedText(studentCode);

  console.log("Querying Pinecone...");

  const queryOptions = {
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true,
  };
 
  // Query Pinecone 
  if (language) {
    queryOptions.filter = {
        language: { $eq: language },
    };
}

  const result = await index.query(queryOptions);
    
  let matches = result.matches || [];
 
  console.log(`Found ${matches.length} matches`);

  return matches.slice(0, topK).map((m) => ({
    id: m.id,
    score: m.score,
    text: m.metadata?.text || null,
    category: m.metadata?.category || null,
    language: m.metadata?.language || null,
  }));
}

export { retrieveRelevantChunks };
