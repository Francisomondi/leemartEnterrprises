import express from "express";
import { generateToken, mpesaCallback, stkPush} from "../controllers/mpesa.controller.js";
import {
  getMyMpesaTransactions,
  getAllMpesaTransactions,
  getMpesaStatus
} from "../controllers/mpesa.controller.js";

import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/stk", protectRoute, generateToken ,stkPush);
router.post("/callback", mpesaCallback);

router.get("/my", protectRoute, getMyMpesaTransactions);

router.get("/all", protectRoute, adminRoute, getAllMpesaTransactions);
router.get("/status/:checkoutRequestID", getMpesaStatus);




export default router;
