import 'dotenv/config';

import http from 'http';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';

import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { connectDB } from './db.js';

await connectDB();

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

app.use(
  session({
    name: "devpilot.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "authdb",
      ttl: SESSION_MAX_AGE / 1000
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // 🔥 IMPORTANT (local dev)
      maxAge: SESSION_MAX_AGE
    }
  })
);

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res })
  })
);

const PORT = 4001;

await new Promise((resolve) =>
  httpServer.listen({ port: PORT }, resolve)
);

console.log("[auth] running on 4001");