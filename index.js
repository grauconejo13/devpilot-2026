import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 🔥 TEMP AUTH (for testing)
app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: req.user
    })
  })
);

await connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}/graphql`);
});