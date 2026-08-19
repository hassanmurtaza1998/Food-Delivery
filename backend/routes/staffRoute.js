import express from "express";
import { createStaff, listStaff, setStaffActive, removeStaff } from "../controllers/staffController.js";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const staffRouter = express.Router();

staffRouter.post("/create", authMiddleware, isAdmin, createStaff);
staffRouter.get("/list", authMiddleware, isAdmin, listStaff);
staffRouter.post("/set-active", authMiddleware, isAdmin, setStaffActive);
staffRouter.post("/remove", authMiddleware, isAdmin, removeStaff);

export default staffRouter;
