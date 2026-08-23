import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { validateEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import promoRouter from "./routes/promoRoute.js";
import staffRouter from "./routes/staffRoute.js";
import activityRouter from "./routes/activityRoute.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { stripeWebhook } from "./controllers/orderController.js";
import morgan from "morgan";

validateEnv();

// app config
const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Stripe requires the raw, unparsed body to verify webhook signatures,
// so this route must be registered before express.json().
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

//middlewares
// The admin/frontend apps live on different origins (ports in dev, likely
// subdomains in prod) and load food images directly from this API, so the
// default same-origin Cross-Origin-Resource-Policy would silently block them.
app.use(morgan("dev"));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);
app.use(apiLimiter);

// DB connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/promo", promoRouter);
app.use("/api/staff", staffRouter);
app.use("/api/activity", activityRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
});
