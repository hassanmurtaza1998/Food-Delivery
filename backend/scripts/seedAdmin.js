import "dotenv/config";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";

const run = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, MONGO_URL } = process.env;

  if (!MONGO_URL) {
    console.error("MONGO_URL is not set. Copy backend/.env.example to backend/.env and fill it in.");
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before running this script.");
    process.exit(1);
  }
  if (!validator.isEmail(ADMIN_EMAIL)) {
    console.error("ADMIN_EMAIL is not a valid email address.");
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await userModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`"${ADMIN_EMAIL}" is already an admin. Nothing to do.`);
    } else {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing user "${ADMIN_EMAIL}" to admin.`);
    }
  } else {
    const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await userModel.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Created new admin user "${ADMIN_EMAIL}".`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
