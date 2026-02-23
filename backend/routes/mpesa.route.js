// routes/mpesa.routes.js
import express from "express";
import {
  generateToken,
  stkPush,
  mpesaCallback,
  getMyMpesaTransactions,
  getAllMpesaTransactions,
  getMpesaStatus,
} from "../controllers/mpesa.controller.js";

import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/stk", protectRoute, generateToken, stkPush);


router.post("/callback", mpesaCallback);


router.get("/status/:checkoutRequestID", getMpesaStatus);


router.get("/my", protectRoute, getMyMpesaTransactions);


router.get("/all", protectRoute, adminRoute, getAllMpesaTransactions);

export default router;