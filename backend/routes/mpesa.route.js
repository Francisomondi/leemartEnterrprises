import express from "express";
import { stkPush, mpesaCallback,getAccessToken } from "../controllers/mpesa.controller.js";

const router = express.Router();

router.post("/stk-push", getAccessToken, stkPush);
router.post("/callback", mpesaCallback);


export default router;
