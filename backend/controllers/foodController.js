import foodModel from "../models/foodModel.js";
import fs from "fs";
import { logActivity } from "../services/activityService.js";

const SPICE_LEVELS = ["None", "Mild", "Medium", "Hot"];

const parseFoodFields = (body) => {
  const fields = {};
  if (body.name !== undefined) fields.name = body.name;
  if (body.description !== undefined) fields.description = body.description;
  if (body.category !== undefined) fields.category = body.category;
  if (body.price !== undefined) fields.price = Number(body.price);
  if (body.discountPrice !== undefined) {
    fields.discountPrice = body.discountPrice === "" ? null : Number(body.discountPrice);
  }
  if (body.isVeg !== undefined) fields.isVeg = body.isVeg === "true" || body.isVeg === true;
  if (body.isBestseller !== undefined) {
    fields.isBestseller = body.isBestseller === "true" || body.isBestseller === true;
  }
  if (body.spiceLevel !== undefined && SPICE_LEVELS.includes(body.spiceLevel)) {
    fields.spiceLevel = body.spiceLevel;
  }
  if (body.prepTimeMinutes !== undefined) fields.prepTimeMinutes = Number(body.prepTimeMinutes);
  if (body.rating !== undefined) fields.rating = Number(body.rating);
  return fields;
};

const validateFoodFields = (fields) => {
  if (fields.price !== undefined && (isNaN(fields.price) || fields.price <= 0)) {
    return "Invalid price";
  }
  if (
    fields.discountPrice !== undefined &&
    fields.discountPrice !== null &&
    (isNaN(fields.discountPrice) || fields.discountPrice < 0 || (fields.price && fields.discountPrice >= fields.price))
  ) {
    return "Discount price must be lower than the regular price";
  }
  if (fields.prepTimeMinutes !== undefined && (isNaN(fields.prepTimeMinutes) || fields.prepTimeMinutes < 0)) {
    return "Invalid preparation time";
  }
  if (fields.rating !== undefined && (isNaN(fields.rating) || fields.rating < 0 || fields.rating > 5)) {
    return "Rating must be between 0 and 5";
  }
  return null;
};

// add food items
const addFood = async (req, res) => {
  try {
    const fields = parseFoodFields(req.body);
    if (!fields.name || !fields.description || !fields.category || !fields.price) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: "Missing required fields" });
    }
    const validationError = validateFoodFields(fields);
    if (validationError) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: validationError });
    }

    const food = new foodModel({
      ...fields,
      image: req.file.filename,
    });
    await food.save();
    logActivity("food_added", `${food.name} was added to the menu`, {
      actorId: req.body.userId,
      actorRole: "admin",
      metadata: { foodId: food._id.toString() },
    });
    res.json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// edit an existing food item (image replacement optional)
const updateFood = async (req, res) => {
  try {
    const { id } = req.body;
    const existing = await foodModel.findById(id);
    if (!existing) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: "Food not found" });
    }

    const fields = parseFoodFields(req.body);
    const mergedPrice = fields.price !== undefined ? fields.price : existing.price;
    const validationError = validateFoodFields({ ...fields, price: mergedPrice });
    if (validationError) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: validationError });
    }

    if (req.file) {
      fs.unlink(`uploads/${existing.image}`, () => {});
      fields.image = req.file.filename;
    }

    const food = await foodModel.findByIdAndUpdate(id, fields, { new: true });
    logActivity("food_updated", `${food.name} was updated`, {
      actorId: req.body.userId,
      actorRole: "admin",
      metadata: { foodId: food._id.toString() },
    });
    res.json({ success: true, message: "Food Updated", data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all foods (supports optional pagination + filters:
// ?page=1&limit=20&category=Salad&veg=true&bestseller=true&search=paneer)
const listFood = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.veg === "true") filter.isVeg = true;
    if (req.query.bestseller === "true") filter.isBestseller = true;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const [foods, total] = await Promise.all([
      foodModel
        .find(filter)
        .sort({ isBestseller: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      foodModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: foods,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }
    fs.unlink(`uploads/${food.image}`, () => {});
    await foodModel.findByIdAndDelete(req.body.id);
    logActivity("food_removed", `${food.name} was removed from the menu`, {
      actorId: req.body.userId,
      actorRole: "admin",
    });
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// toggle stock availability
const updateStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const food = await foodModel.findByIdAndUpdate(id, { inStock: !!inStock }, { new: true });
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }
    res.json({ success: true, message: "Stock Updated", data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, updateFood, listFood, removeFood, updateStock };
