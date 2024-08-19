//https://codevoweb.com/graphql-crud-api-nextjs-mongodb-typegraphql/

import mongoose from 'mongoose';
import getConfig from '../config';

//console.log(process.env)
export type TypeOfMongoose = typeof mongoose

const localUri = getConfig("MONGO_URI")

const connection: any = {};

export async function connectDB() {
  if (connection.isConnected) {
    console.log('DB is already connected');
    return
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log('use previous connection');
      return
    }
    await mongoose.disconnect();
  }

  const db = await mongoose.connect(localUri);
  console.log('? MongoDB Database Connected Successfully');
  connection.isConnected = db.connections[0].readyState;
}

export async function disconnectDB() {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = false;
    // if (process.env.NODE_ENV === 'production') {
      
    // } else {
    //   console.log('not discounted');
    // }
  }
}
