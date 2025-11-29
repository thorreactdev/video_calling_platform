import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { createSession, getActiveSession, getMyPastSession, getSessionById , joinSession , endSession } from "../controller/sessionController.js";


const router = express.Router();

router.post("/" , protectedRoute , createSession);
router.get("/active", protectedRoute , getActiveSession);
router.get("/my-past-session", protectedRoute , getMyPastSession);
router.get("/:id" , protectedRoute , getSessionById);
router.post("/:id/join" , protectedRoute , joinSession);
router.post("/:id/end" , protectedRoute , endSession);


export default router;