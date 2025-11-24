import express from "express";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import { inngest , functions} from "./lib/inngest.js";
import { serve } from "inngest/express";
import path from "path";

const app = express();
app.use(express.json());
app.use(cors({
  origin : ENV.CLIENT_URL,
  credentials: true
}))

const __dirname = path.resolve();

app.get("/", (req, res) => {
  res.json({ message: "api is up and running" });
});


app.use("/api/inngest" , serve({ client : inngest, functions}));
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("/{*any}", () => {
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