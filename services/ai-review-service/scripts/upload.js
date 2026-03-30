import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

console.log("Upload script started...");


// ENV SAFETY CHECK
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX?.trim();

if (!PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY");
}

if (!PINECONE_INDEX) {
  throw new Error("Missing PINECONE_INDEX");
}

console.log("USING INDEX:", PINECONE_INDEX);


// INIT CLIENTS
const pc = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pc.index(PINECONE_INDEX);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// LOAD DATA FILES
const dataDir = path.join(process.cwd(), "../documents");

if (!fs.existsSync(dataDir)) {
  throw new Error(`Folder not found: ${dataDir}`);
}

const files = fs.readdirSync(dataDir);

console.log("Files found:", files);


// EMBEDDINGS
async function embed(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const embedding = res.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error("Invalid embedding response");
  }

  return embedding;
}


// MAIN UPLOAD
async function run() {
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");

    let items;

    try {
      items = JSON.parse(raw);
    } catch (e) {
      console.log(`Skipping invalid JSON: ${file}`);
      continue;
    }

    console.log(`Loaded ${file}, items: ${items.length}`);

    for (const item of items) {
      const id = item.id || crypto.randomUUID();

      const text =
        item.text ||
        item.content ||
        item.description ||
        "";

      if (!text.trim()) {
        console.log(`Skipping empty item: ${id}`);
        continue;
      }

      console.log(`Processing: ${id}`);

      const embedding = await embed(text);

      console.log("Embedding length:", embedding.length);

      const vector = {
        id: String(id),
        values: embedding,
        metadata: {
          text,
          source: file,
        },
      };

      console.log("UPSERTING:", id);

      // UPSERT
      await index.upsert([vector]);

      console.log("Uploaded:", id);
    }
  }

  console.log("Upload complete");
}

run().catch((err) => {
  console.error("Upload failed:", err);
});
