import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import mpesaRoutes from "./routes/mpesa.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";


import { connectDB } from "./lib/db.js";



const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

/* ------------------ CORE MIDDLEWARE ------------------ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------ CORS (API ONLY) ------------------ */
const allowedOrigins = [
  "http://localhost:5173",
  "https://leemartenterrprises.onrender.com",
  "https://www.leemart.co.ke"
];

app.use(
  "/api",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.options("/api/*", cors());

/* ------------------ API ROUTES (ALWAYS) ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/orders", orderRoutes);


/* ------------------ STATIC FRONTEND ------------------ */
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "frontend/dist"), {
      maxAge: "1y",
    })
  );

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "frontend", "dist", "index.html")
    );
  });
}

/* ------------------ START SERVER ------------------ */
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
