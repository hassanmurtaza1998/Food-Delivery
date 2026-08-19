import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import promoModel from "../models/promoModel.js";
import Stripe from "stripe";
import { DELIVERY_FEE, CURRENCY } from "../config/constants.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderCancelledEmail,
} from "../services/emailService.js";
import { logActivity } from "../services/activityService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const round2 = (n) => Math.round(n * 100) / 100;

// Short, unguessable, human-friendly ID customers can use to look up an
// order without logging in. Retries on the (astronomically unlikely)
// chance of a collision against the schema's unique index.
const generateUniqueTrackingId = async () => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `TMT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const exists = await orderModel.exists({ trackingId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Could not generate a unique tracking ID");
};

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL;
  try {
    const { userId, items, address, promoCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }
    if (!address || typeof address !== "object") {
      return res.json({ success: false, message: "Delivery address is required" });
    }

    // Re-derive item prices/names from the DB. Never trust client-supplied prices.
    const itemIds = items.map((i) => i._id);
    const dbFoods = await foodModel.find({ _id: { $in: itemIds } });
    const dbFoodMap = new Map(dbFoods.map((f) => [f._id.toString(), f]));

    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const dbFood = dbFoodMap.get(item._id);
      const quantity = Number(item.quantity);
      if (!dbFood || !dbFood.inStock || !Number.isInteger(quantity) || quantity <= 0) {
        return res.json({ success: false, message: `Item unavailable: ${item.name || item._id}` });
      }
      const effectivePrice =
        dbFood.discountPrice && dbFood.discountPrice < dbFood.price ? dbFood.discountPrice : dbFood.price;
      orderItems.push({
        _id: dbFood._id,
        name: dbFood.name,
        price: effectivePrice,
        image: dbFood.image,
        quantity,
      });
      subtotal += effectivePrice * quantity;
    }

    // Server-side promo validation/discount
    let discount = 0;
    let appliedPromoCode;
    if (promoCode) {
      const promo = await promoModel.findOne({ code: promoCode.toUpperCase(), active: true });
      if (promo && promo.expiresAt > new Date() && subtotal >= promo.minOrderAmount) {
        discount = round2((subtotal * promo.discountPercent) / 100);
        appliedPromoCode = promo.code;
      }
    }

    const amount = round2(subtotal - discount + DELIVERY_FEE);
    const trackingId = await generateUniqueTrackingId();

    const newOrder = new orderModel({
      userId,
      trackingId,
      items: orderItems,
      amount,
      address,
      promoCode: appliedPromoCode,
      discount,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    logActivity("order_placed", `New order placed (#${newOrder._id.toString().slice(-6)})`, {
      actorId: userId,
      actorRole: "user",
      metadata: { orderId: newOrder._id.toString(), amount },
    });

    const discountRatio = subtotal > 0 ? discount / subtotal : 0;
    const line_items = orderItems.map((item) => ({
      price_data: {
        currency: CURRENCY,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * (1 - discountRatio) * 100),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: CURRENCY,
        product_data: { name: "Delivery Charges" },
        unit_amount: Math.round(DELIVERY_FEE * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      metadata: { orderId: newOrder._id.toString(), userId },
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const markPaidAndNotify = async (order) => {
  order.payment = true;
  await order.save();
  const user = await userModel.findById(order.userId);
  if (user) sendOrderConfirmationEmail(user.email, order);
  logActivity("order_paid", `Order #${order._id.toString().slice(-6)} was paid`, {
    actorId: order.userId,
    actorRole: "user",
    metadata: { orderId: order._id.toString(), amount: order.amount },
  });
};

// Verify payment status directly against Stripe (never trust the client's `success` flag alone).
const verifyOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    if (order.userId !== req.body.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.payment) {
      return res.json({ success: true, message: "Paid" });
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      await markPaidAndNotify(order);
      return res.json({ success: true, message: "Paid" });
    }

    if (session.status === "expired" || session.status === "open") {
      await orderModel.findByIdAndDelete(orderId);
    }
    res.json({ success: false, message: "Not Paid" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Stripe webhook: authoritative, idempotent payment confirmation independent of client redirect.
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await orderModel.findById(orderId);
      if (order && !order.payment) {
        await markPaidAndNotify(order);
      }
    }
  }

  res.json({ received: true });
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const [orders, total] = await Promise.all([
      orderModel
        .find({ userId: req.body.userId })
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      orderModel.countDocuments({ userId: req.body.userId }),
    ]);
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin/subadmin staff
const listOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const filter = req.query.status ? { status: req.query.status } : {};
    const [orders, total] = await Promise.all([
      orderModel
        .find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      orderModel.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status (staff: admin or subadmin)
const updateStatus = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(
      req.body.orderId,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    const user = await userModel.findById(order.userId);
    if (user) sendOrderStatusEmail(user.email, order);
    logActivity("order_status_updated", `Order #${order._id.toString().slice(-6)} marked "${order.status}"`, {
      actorId: req.body.userId,
      actorRole: req.body.actorRole,
      metadata: { orderId: order._id.toString(), status: order.status },
    });
    res.json({ success: true, message: "Status Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// customer-initiated cancellation (only while still in "Food Processing")
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    if (order.userId !== req.body.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.status !== "Food Processing") {
      return res.json({ success: false, message: "Order can no longer be cancelled" });
    }

    if (order.payment && order.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_intent) {
        await stripe.refunds.create({ payment_intent: session.payment_intent });
      }
    }

    order.status = "Cancelled";
    await order.save();
    const user = await userModel.findById(order.userId);
    if (user) sendOrderCancelledEmail(user.email, order);
    logActivity("order_cancelled", `Order #${order._id.toString().slice(-6)} was cancelled`, {
      actorId: req.body.userId,
      actorRole: "user",
      metadata: { orderId: order._id.toString() },
    });
    res.json({ success: true, message: "Order Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// public: look up an order by its tracking ID — no login required.
// Deliberately omits address/phone/userId so a leaked/guessed ID can't
// expose the customer's identity or contact details.
const TRACKING_ID_PATTERN = /^TMT-[A-F0-9]{10}$/;

const trackOrder = async (req, res) => {
  try {
    const trackingId = (req.params.trackingId || "").trim().toUpperCase();
    if (!TRACKING_ID_PATTERN.test(trackingId)) {
      return res.json({ success: false, message: "No order found for that tracking ID" });
    }
    const order = await orderModel
      .findOne({ trackingId })
      .select("trackingId items amount status date payment discount");
    if (!order) {
      return res.json({ success: false, message: "No order found for that tracking ID" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin dashboard summary stats
const dashboardStats = async (req, res) => {
  try {
    const [totalOrders, revenueAgg, statusCounts, topItems, totalUsers, totalStaff] = await Promise.all([
      orderModel.countDocuments({ payment: true }),
      orderModel.aggregate([
        { $match: { payment: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      orderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      orderModel.aggregate([
        { $match: { payment: true } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
      userModel.countDocuments({ role: "user" }),
      userModel.countDocuments({ role: "subadmin" }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        topItems,
        totalUsers,
        totalStaff,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// admin: revenue/orders broken down by day (last 7), day (last 30), or month (last 12)
const revenueAnalytics = async (req, res) => {
  try {
    const period = ["week", "month", "year"].includes(req.query.period) ? req.query.period : "week";
    const now = new Date();
    let startDate;
    let dateFormat;
    let bucketCount;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m-%d";
      bucketCount = 7;
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m-%d";
      bucketCount = 30;
    } else {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m";
      bucketCount = 12;
    }

    const raw = await orderModel.aggregate([
      { $match: { payment: true, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$date" } },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const byKey = new Map(raw.map((r) => [r._id, r]));

    const buckets = [];
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(now);
      let key;
      if (period === "year") {
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        d.setDate(d.getDate() - i);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
      const found = byKey.get(key);
      buckets.push({ label: key, revenue: round2(found?.revenue || 0), orders: found?.orders || 0 });
    }

    res.json({ success: true, data: buckets });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export {
  placeOrder,
  verifyOrder,
  stripeWebhook,
  userOrders,
  listOrders,
  updateStatus,
  cancelOrder,
  trackOrder,
  dashboardStats,
  revenueAnalytics,
};
