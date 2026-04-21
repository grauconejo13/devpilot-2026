import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

dotenv.config();

class CookieForwardingDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    const cookie = context?.req?.headers?.cookie;
    if (cookie) {
      request.http.headers.set('cookie', cookie);
    }

    const authHeader = context?.req?.headers?.authorization;
    if (authHeader) {
      request.http.headers.set('authorization', authHeader);
    }

    request.http.headers.set('x-from-gateway', 'true');
  }

  didReceiveResponse({ response, context }) {
    if (!response?.http?.headers) {
      return response;
    }

    const setCookieHeader = response.http.headers.get('set-cookie');
    if (setCookieHeader) {
      context?.res?.append?.('Set-Cookie', setCookieHeader);
    }

    if (typeof response.http.headers.getSetCookie === 'function') {
      const cookies = response.http.headers.getSetCookie();
      cookies.forEach((cookie) => {
        context?.res?.append?.('Set-Cookie', cookie);
      });
    }

    return response;
  }
}

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());

app.get('/health', (_, res) => {
  res.status(200).json({
    ok: true,
    service: 'gateway'
  });
});

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: process.env.AUTH_SUBGRAPH_URL }
    ]
  }),
  buildService({ url }) {
    return new CookieForwardingDataSource({ url });
  }
});

const server = new ApolloServer({
  gateway
});

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res })
  })
);

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`✅ Gateway running at http://localhost:${PORT}/graphql`);
  console.log(`✅ Health check at http://localhost:${PORT}/health`);
});