import express from "express";
import { listActivity } from "../controllers/activityController.js";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const activityRouter = express.Router();

activityRouter.get("/list", authMiddleware, isAdmin, listActivity);

export default activityRouter;
