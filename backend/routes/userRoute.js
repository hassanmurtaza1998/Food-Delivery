import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);

export default userRouter;
