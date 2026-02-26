import express from "express";
import { createMpesaOrder, getOrderById } from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createMpesaOrder);
router.get("/orders/:id", protectRoute, getOrderById);

export default router;