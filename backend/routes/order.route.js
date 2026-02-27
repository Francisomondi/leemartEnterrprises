import express from "express";
import { createMpesaOrder, getSuccessfulOrders } from "../controllers/order.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createMpesaOrder);
//router.get("/orders/:id", protectRoute, getOrderById);
router.get("/success", protectRoute, adminRoute, getSuccessfulOrders);

export default router;