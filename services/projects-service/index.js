import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildSubgraphSchema } from "@apollo/subgraph";

import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";

const app = express();
const httpServer = http.createServer(app);

// ======================
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ======================
// 🔥 CONNECT MONGO HERE
// ======================
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devpilot";

await mongoose.connect(MONGO_URI);
console.log("✅ MongoDB connected");

// ======================
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      req,
      res,
      user: { id: "dev-user" }, // TEMP
    }),
  })
);

// ======================
const PORT = 4002;

await new Promise((resolve) =>
  httpServer.listen({ port: PORT }, resolve)
);

console.log("🚀 projects-service running on 4002");