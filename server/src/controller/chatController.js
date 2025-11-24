import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res , next) {
    try{
        const token = chatClient.createToken(req.user.clerkId);
        if(!token){
            return res.status(500).json({ msg : "Could not create stream token"});
        }

        res.json({
            token ,
            userId : req.user.clerkId,
            userName : req.user.name,
            userImage : req.user.profileImage
        })

    }catch(e){
        return res.status(500).json({ msg : "Internal server error" });
    }    
}