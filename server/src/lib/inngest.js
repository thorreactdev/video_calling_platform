import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../model/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id : "video-calling-platform" });

const syncUser = inngest.createFunction(
    {id : "sync/clerk-user-created"},
    {event : "clerk/user.created"},
    async ({event}) =>{
        await connectDB();
        console.log("User created event received:", event.data);
        const { id , first_name , last_name , email_addresses , image_url } = event.data;

        const newUser = {
            clerkId : id,
            email : email_addresses[0]?.email_address,
            name : `${first_name || ""} ${last_name || ""}`,
            profileImage : image_url || ""
        }

        await User.create(newUser);
        await upsertStreamUser({
            id : newUser.clerkId.toString(),
            name : newUser.name,
            image : newUser.profileImage
        })
    }
);

const deleteUserFromDb= inngest.createFunction(
    {id : "sync/clerk-user-deleted"},
    {event : "clerk/user.deleted"},

    async({event}) => {
        await connectDB();
        const { id } = event.data;
        await User.deleteOne({clerkId : id});
        await deleteStreamUser(id.toString());
    }
);

export const functions = [ syncUser, deleteUserFromDb];