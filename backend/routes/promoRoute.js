import express from "express";
import { validatePromo, createPromo, listPromos, deletePromo } from "../controllers/promoController.js";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { lookupLimiter } from "../middleware/rateLimiter.js";

const promoRouter = express.Router();

promoRouter.post("/validate", lookupLimiter, validatePromo);
promoRouter.post("/create", authMiddleware, isAdmin, createPromo);
promoRouter.get("/list", authMiddleware, isAdmin, listPromos);
promoRouter.post("/remove", authMiddleware, isAdmin, deletePromo);

export default promoRouter;
