import userModel from "../models/userModel.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user || !user.active || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not an admin" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

export default isAdmin;
