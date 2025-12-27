import express from "express";
import { generateToken, mpesaCallback, stkPush} from "../controllers/mpesa.controller.js";


const router = express.Router();

router.post("/stk",generateToken ,stkPush);
router.post("/callback", mpesaCallback);




export default router;
