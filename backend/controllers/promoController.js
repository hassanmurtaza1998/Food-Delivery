import promoModel from "../models/promoModel.js";
import { logActivity } from "../services/activityService.js";

// public: validate a promo code against a cart subtotal
const validatePromo = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.json({ success: false, message: "Promo code is required" });
    }
    const promo = await promoModel.findOne({ code: code.toUpperCase(), active: true });
    if (!promo) {
      return res.json({ success: false, message: "Invalid promo code" });
    }
    if (promo.expiresAt <= new Date()) {
      return res.json({ success: false, message: "Promo code has expired" });
    }
    if (Number(subtotal) < promo.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order amount is $${promo.minOrderAmount}`,
      });
    }
    res.json({ success: true, discountPercent: promo.discountPercent, code: promo.code });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: create promo code
const createPromo = async (req, res) => {
  try {
    const { code, discountPercent, minOrderAmount, expiresAt } = req.body;
    if (!code || !discountPercent || !expiresAt) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    const promo = new promoModel({
      code: code.toUpperCase(),
      discountPercent,
      minOrderAmount: minOrderAmount || 0,
      expiresAt,
    });
    await promo.save();
    logActivity("promo_created", `Promo code ${promo.code} was created`, {
      actorId: req.body.userId,
      actorRole: "admin",
      metadata: { promoId: promo._id.toString() },
    });
    res.json({ success: true, message: "Promo Created", data: promo });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "Promo code already exists" });
    }
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: list all promo codes
const listPromos = async (req, res) => {
  try {
    const promos = await promoModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: deactivate/delete a promo code
const deletePromo = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Promo Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { validatePromo, createPromo, listPromos, deletePromo };
