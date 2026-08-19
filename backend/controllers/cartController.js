import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// add items to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const food = await foodModel.findById(itemId);
    if (!food) {
      return res.json({ success: false, message: "Item not found" });
    }
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const cartData = userData.cartData;
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added to Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove from cart
const removeFromCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const cartData = userData.cartData;
    const { itemId, removeAll } = req.body;
    if (!removeAll && cartData[itemId] > 1) {
      cartData[itemId] -= 1;
    } else {
      delete cartData[itemId];
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed from Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// fetch user cart data
const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart };
