import mongoose from "mongoose";
import { ENV } from "./env.js";

export async function connectDB() {
  try {
    if(!ENV.DB_URL){
        return console.error("❌ DB_URL is not defined in environment variables");
    }
   const conn =  await mongoose.connect(ENV.DB_URL);
   console.log("✅ MongoDB connected:", conn.connection.host);
  } catch (e) {
    console.error("❌ Error connecting to MongoDB", e);
    process.exit(1);
  }
}
