import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../model/Session.js";
import { v4 as uuidv4 } from "uuid";

export async function createSession(req, res, next) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });
    }

    //unique call Id for video stream
    const callId = uuidv4();

    //create the session in db
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    //create a video stream call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problem,
          difficulty,
          sessionId: session._id.toString(),
        },
      },
    });

    //chat messaging

    const channel = await chatClient.channel("messaging", callId, {
      name: `${problem} - Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getActiveSession(req, res, next) {
  try {
    const session = await Session.find({ status: "active" }).populate(
      "host",
      "name email profileImage clerkId"
    );

    if (!session || session.length === 0) {
      return res.status(404).json({ message: "No active sessions found" });
    }

    res.status(200).json({ session });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyPastSession(req, res, next) {
  try {
    const userId = req.user._id;
    const session = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("host participant", "name email profileImage clerkId");

    if (!session || session.length === 0) {
      return res.status(404).json({ message: "No past sessions found" });
    }

    res.status(200).json({ session });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSessionById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await Session.findById(id).populate(
      "host participant",
      "name email profileImage clerkId"
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function joinSession(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if(session.status !== "active"){
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if(session.host.toString === userId.toString()){
        return res.status(400).json({ message: "Host cannot join as participant" });
    }

    if (session.participant) {
      return res.status(409).json({ message: "Session is full" });
    }

    session.participant = userId;
    await session.save();

    const channel = await chatClient.channel("messaging", session.callID);
    await channel.addMembers([clerkId]);


    res.status(200).json({ session });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function endSession(req, res, next) {
    try{
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);
        if(!session){
            return res.status(404).json({ message: "Session not found" });
        }

        if(session.host.toString() !== userId.toString()){
            return res.status(403).json({ message: "Only the host can end the session" });
        }

        if(session.status === "completed"){
            return res.status(400).json({ message: "Session is already completed" });
        }

        //delete the video call from stream
        const call = await streamClient.video.call("default" , session.callID);
        await call.delete({ hard : true});

        //delete the chat channel
        const channel = await chatClient.channel("messaging", session.callID);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({ session,message: "Session ended successfully" });
    }catch(e){
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
