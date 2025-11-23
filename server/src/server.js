import express from "express";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "api is up and running" });
});








async function startServer() {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server is running on port ${ENV.PORT}`);
    });
  } catch (e) {
    return console.error("Failed to start server", e);
  }
}

startServer();