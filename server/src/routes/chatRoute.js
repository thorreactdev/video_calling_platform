import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { getStreamToken } from "../controller/chatController.js";

const router = express.Router();

router.get("/token" , protectedRoute , getStreamToken);


export default router;