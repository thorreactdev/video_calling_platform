import express from "express";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import { inngest , functions} from "./lib/inngest.js";
import { serve } from "inngest/express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { protectedRoute } from "./middleware/protectedRoute.js";

const app = express();
app.use(express.json());

app.use(clerkMiddleware());


const __dirname = path.resolve();

app.get("/h", (req, res) => {
  res.json({ message: "api is up and running" });
});




app.use("/api/inngest" , serve({ client : inngest, functions}));
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("/{*any}", (req,res) => {
  res.sendFile(path.join(__dirname, "client" , "dist" , "index.html"));
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