import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️ MONGODB_URI is not defined in environment variables.");
    console.warn("📂 Switching to high-performance local JSON file persistence for the AI Studio live preview.");
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`🔌 MongoDB Connected Successfully: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    console.warn("📂 Falling back to local JSON file persistence to prevent runtime crash.");
    isConnected = false;
    return false;
  }
};

export const getDbStatus = (): { type: "mongodb" | "file"; connected: boolean } => {
  return {
    type: isConnected ? "mongodb" : "file",
    connected: isConnected,
  };
};
