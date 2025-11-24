import { requireAuth } from "@clerk/express";
import User from "../model/User.js";

export const protectedRoute = [
    requireAuth(),
    async (req, res ,next) =>{
        try{
            const clerkId = req.auth().userId;
            console.log("Authenticated clerkId:", clerkId);
            if(!clerkId){
                return res.status(401).json({ msg : "Unauthorized"});
            }
            const user = await User.findOne({ clerkId});
            if(!user){
                return res.status(404).json({ msg : "No user found"});
            }
            req.user = user;
            next();

        }catch(e){
            return res.status(500).json({ error : "Internal server error"});
        }
    }
];
