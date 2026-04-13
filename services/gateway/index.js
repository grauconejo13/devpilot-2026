import 'dotenv/config';

import http from 'http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource
} from '@apollo/gateway';

// Forwards cookies from the browser to subgraphs and relays Set-Cookie back — no auth logic here
class CookieForwardingDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.req?.headers?.cookie) {
      request.http.headers.set('cookie', context.req.headers.cookie);
    }
  }

  async didReceiveResponse({ response, context }) {
    const setCookie = response.http.headers.get('set-cookie');
    if (setCookie && context.res) {
      const incoming = Array.isArray(setCookie) ? setCookie : [setCookie];
      const existing = context.res.getHeader('set-cookie') ?? [];
      const existingArray = Array.isArray(existing) ? existing : [String(existing)];
      context.res.setHeader('set-cookie', [...existingArray, ...incoming]);
    }
    return response;
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth',     url: process.env.AUTH_SERVICE_URL     || 'http://localhost:4001/graphql' },
      { name: 'projects', url: process.env.PROJECTS_SERVICE_URL || 'http://localhost:4002/graphql' }
    ]
  }),
  buildService({ url }) {
    return new CookieForwardingDataSource({ url });
  }
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  gateway,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use(
  '/graphql',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res })
  })
);

const PORT = process.env.PORT || 4000;

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`[gateway] Running at http://localhost:${PORT}/graphql`);
