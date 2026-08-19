import express from "express";
import path from "path";
import crypto from "crypto";
import { addFood, updateFood, listFood, removeFood, updateStock } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const foodRouter = express.Router();

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    return cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPEG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

const handleUpload = (required) => (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (required && !req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    next();
  });
};

// Auth/admin checks run before multer touches the filesystem.
foodRouter.post("/add", authMiddleware, isAdmin, handleUpload(true), addFood);
foodRouter.post("/update", authMiddleware, isAdmin, handleUpload(false), updateFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", authMiddleware, isAdmin, removeFood);
foodRouter.post("/update-stock", authMiddleware, isAdmin, updateStock);

export default foodRouter;
