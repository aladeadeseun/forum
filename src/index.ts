

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';

import { WebSocketServer } from 'ws';

import depthLimit from 'graphql-depth-limit';

import getConfig from "./config";

import schema from "./schema";

interface MyContext {
  token?: String;
}

async function main(){
  
  const PORT = getConfig("PORT");

  // Create an Express app and HTTP server; we will attach the WebSocket
  // server and the ApolloServer to this HTTP server.
  const app = express();
  const httpServer = createServer(app);

  // Set up WebSocket server.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  const serverCleanup = useServer({ schema }, wsServer);

  // Set up ApolloServer.
  const server = new ApolloServer<MyContext>({
    schema,
    validationRules:[depthLimit(10)],
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  app.use(
    '/graphql', 
    cors<cors.CorsRequest>(), 
    bodyParser.json(), 
    expressMiddleware(server, {
      context: async ({ req }: {req:any}) => {
        return {token:req.header['token']}
      },
    })
  );

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);
  });

}

main()