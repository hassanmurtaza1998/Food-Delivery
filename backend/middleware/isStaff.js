import userModel from "../models/userModel.js";

// Allows admins and subadmins (order-fulfilment staff). Use isAdmin instead
// for routes that must stay super-admin only (menu, promos, staff, analytics).
const isStaff = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user || !user.active || !["admin", "subadmin"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "You are not authorized" });
    }
    req.body.actorRole = user.role;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

export default isStaff;
