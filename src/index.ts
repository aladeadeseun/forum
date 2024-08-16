

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import compression from "compression";

import cookieParser from "cookie-parser";

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';

import { WebSocketServer } from 'ws';

import depthLimit from 'graphql-depth-limit';

import getConfig from "./config";

import { connectDB, disconnectDB } from './db/connectDB';
import { authMiddleware, getUploadImgHtml, showImage, uploadCommentImageMiddleware } from './middleware';
import schema from "./schema";
import { Context, context } from './util/context';

process.on("uncaughtException", (err) => {
  console.log(`Error occur ${err}`);
  //process.exit(1);
});

// do something when app is closing
process.on('beforeExit', async function(){
  console.log("Disconnect from server.")
  await disconnectDB()
});

async function main(){

  await connectDB()
  
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
  const server = new ApolloServer<Context>({
    schema,
    validationRules:[depthLimit(10)],
    csrfPrevention:true,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer, }),
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
      {
        async requestDidStart() {
          return {
            /**
             * https://www.apollographql.com/docs/apollo-server/migration/
             * https://github.com/apollographql/apollo-server/discussions/7209 
             */
            async willSendResponse(requestContext) {
              const { response } = requestContext;
              // Augment response with an extension, as long as the operation
              // actually executed. (The `kind` check allows you to handle
              // incremental delivery responses specially.)
              //I want to make this changes when sending last response to client
              //Object.keys(omit(response.body.singleResult.data, "__schema")).length > 0
              if (
                response.body.kind === 'single' 
                && response.body.singleResult.data
                && !response.body.singleResult.data.__schema
                && !response.body.singleResult.extensions?.csrf
              ) {
                //const {userAuthReq:{csrf, newToken, exp, keepMeLoggedIn}} = requestContext as GraphQLRequestContextWillSendResponse<Context>

                // const {
                //   userAuthReq:{
                //     csrf, token, exp, keepMeLoggedIn, hasNewToken
                //   }, sessionService
                //   //userAuthReq:{ csrf, token, hasNewToken }
                // } = requestContext.contextValue

                const {
                  userAuthReq:{
                    csrf, hasNewToken, token
                  },
                  //userAuthReq:{ csrf, token, hasNewToken }
                } = requestContext.contextValue

                //Am adding this temporarily because of graphql playground, I might change it later
                const ext: {csrf:string, token?:string} = {csrf}

                //if new token is generated store in cookie
                if(hasNewToken){
                  //response.http.headers.set("Set-Cookie", `${"forum"}=${token};expires=${expiryDate};path=${path};HttpOnly=${httpOnly};Secure=${true};SameSite=None;`)
                  //sessionService.setCookie(response, token, keepMeLoggedIn ? exp : 0);
                  ext.token = token
                }

                response.body.singleResult.extensions = {
                  ...response.body.singleResult.extensions,
                  ...ext
                };
              }
            },
          };
        }
      }
    ],
  });

  await server.start();

  app.use(
    '/graphql', 
    compression(),
    cors<cors.CorsRequest>({
      //origin: 'https://studio.apollographql.com',
      //https://studio.apollographql.com/sandbox/explorer
      origin:"*",
      credentials: true
    }), 
    cookieParser(),
    bodyParser.json(), 
    expressMiddleware(server, { context, })
  );

  app.use(
    "/upload", 
    compression(), 
    cookieParser()
  )

  //upload image for comment body
  app.post("/upload", authMiddleware, uploadCommentImageMiddleware)
  //I needed this for testing purpose
  app.get("/upload", authMiddleware, getUploadImgHtml)

  app.get("/images/show/:cmtImgId", showImage)

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error)