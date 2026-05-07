import mongoose from "mongoose";
import { serverEnv } from "./config";

declare global {
  var __mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  if (!global.__mongooseConnectionPromise) {
    global.__mongooseConnectionPromise = mongoose.connect(serverEnv.MONGODB_URI, {
      autoIndex: true,
    });
  }

  return global.__mongooseConnectionPromise;
}
