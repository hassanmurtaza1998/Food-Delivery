import express from "express";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import isStaff from "../middleware/isStaff.js";
import { lookupLimiter } from "../middleware/rateLimiter.js";
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
  cancelOrder,
  trackOrder,
  dashboardStats,
  revenueAnalytics,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/status", authMiddleware, isStaff, updateStatus);
orderRouter.post("/cancel", authMiddleware, cancelOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", authMiddleware, isStaff, listOrders);
orderRouter.get("/track/:trackingId", lookupLimiter, trackOrder);
orderRouter.get("/dashboard-stats", authMiddleware, isAdmin, dashboardStats);
orderRouter.get("/revenue", authMiddleware, isAdmin, revenueAnalytics);

export default orderRouter;
