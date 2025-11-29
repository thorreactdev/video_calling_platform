import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_SECRET_KEY

if(!apiKey || !apiSecret){
    console.error("Missing Stream API Key or Secret Key");
}

export const streamClient = new StreamClient(apiKey, apiSecret);// for video call
export const chatClient = StreamChat.getInstance(apiKey, apiSecret); // for chatting

export async function upsertStreamUser(userData){
    try{
        await chatClient.upsertUser(userData);
        console.log("Stream user upserted successfully:", userData);

    }catch(e){
        console.error("Error upserting Stream user:", e);
    }
}

export async function deleteStreamUser(userId){
    try{
        await chatClient.deleteUser(userId);
        console.log("Stream user deleted successfully:", userId);

    }catch(e){
        console.error("Error deleting Stream user:", e);
    }
}