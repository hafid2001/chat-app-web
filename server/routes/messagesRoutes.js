import express from "express";
import { getMessages, getUserForSidebar, markMessageAsseen, sendmessage } from "../controller/messageController.js";
import {protectRoute} from "../Middlware/auth.js"



const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUserForSidebar);
messageRouter.get("/:id",protectRoute,getMessages);
messageRouter.put("/mark/:id",protectRoute,markMessageAsseen);
messageRouter.post("/send/:id",protectRoute,sendmessage);


export default messageRouter;