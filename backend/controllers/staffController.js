import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { logActivity } from "../services/activityService.js";

// admin: create a subadmin (order-fulfilment staff) account
const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Name, email, and password are required" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "A user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "subadmin",
    });

    logActivity("staff_created", `Staff account created for ${staff.name}`, {
      actorId: req.body.userId,
      actorRole: "admin",
      metadata: { staffId: staff._id.toString() },
    });

    res.json({
      success: true,
      message: "Staff account created",
      data: { _id: staff._id, name: staff.name, email: staff.email, active: staff.active },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: list all subadmin accounts
const listStaff = async (req, res) => {
  try {
    const staff = await userModel
      .find({ role: "subadmin" })
      .select("name email active createdAt")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: staff });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: activate/deactivate a subadmin account
const setStaffActive = async (req, res) => {
  try {
    const { id, active } = req.body;
    const staff = await userModel.findOneAndUpdate(
      { _id: id, role: "subadmin" },
      { active: !!active },
      { new: true }
    );
    if (!staff) {
      return res.json({ success: false, message: "Staff account not found" });
    }
    logActivity(active ? "staff_activated" : "staff_deactivated", `${staff.name} was ${active ? "activated" : "deactivated"}`, {
      actorId: req.body.userId,
      actorRole: "admin",
      metadata: { staffId: staff._id.toString() },
    });
    res.json({ success: true, message: `Staff ${active ? "activated" : "deactivated"}` });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: permanently remove a subadmin account
const removeStaff = async (req, res) => {
  try {
    const staff = await userModel.findOneAndDelete({ _id: req.body.id, role: "subadmin" });
    if (!staff) {
      return res.json({ success: false, message: "Staff account not found" });
    }
    logActivity("staff_removed", `Staff account removed for ${staff.name}`, {
      actorId: req.body.userId,
      actorRole: "admin",
    });
    res.json({ success: true, message: "Staff account removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { createStaff, listStaff, setStaffActive, removeStaff };
