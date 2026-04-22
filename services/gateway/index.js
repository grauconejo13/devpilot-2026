import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

/**
 * 🔥 FIX 1: force fresh schema (disable cache issues)
 */
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4001/graphql" },
      { name: "projects", url: "http://localhost:4002/graphql" }
    ],
    pollIntervalInMs: 10000 // 🔥 keep schema fresh every 10s (dev only)
  })
});

/**
 * 🔥 FIX 2: log gateway errors clearly
 */
const server = new ApolloServer({
  gateway,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async requestDidStart() {
        return {
          didEncounterErrors(ctx) {
            console.log("🔥 GATEWAY ERROR:", ctx.errors);
          }
        };
      }
    }
  ]
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      return {
        req,
        res,
        user: req.session?.userId
          ? { id: req.session.userId }
          : null
      };
    }
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

await new Promise((resolve) =>
  httpServer.listen({ port: 4000 }, resolve)
);

console.log("[gateway] running on 4000");