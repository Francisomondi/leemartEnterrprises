import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import MpesaTransaction from "../models/mpesaTransaction.model.js";
import MpesaOrder from "../models/mpesaOrder.model.js";


dotenv.config();

const shortcode = process.env.MPESA_SHORTCODE
const passkey = process.env.MPESA_PASSKEY
const callbackUrl = process.env.MPESA_CALLBACK_URL
const consumerKey = process.env.MPESA_CONSUMER_KEY
const consumerSecret = process.env.MPESA_CONSUMER_SECRET

	 const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
			 

export const generateToken = async (req, res, next) => {
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    req.mpesaToken = response.data.access_token; // ✅ attach to req
	  console.log(req.mpesaToken)
    next();

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Token generation failed",
      error: error.message,
    });
  }
};

// ================= STK PUSH =================
export const stkPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount and orderId are required",
      });
    }

     // 🔒 HARD GUARD (THIS FIXES EVERYTHING)
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid orderId. Order must be created first.",
      });
    }

    const order = await MpesaOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const safeAmount = Number(amount);
    if (isNaN(safeAmount) || safeAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const formatPhoneNumber = (phone) => {
      if (phone.startsWith("0")) return "254" + phone.slice(1);
      if (phone.startsWith("7") || phone.startsWith("1")) return "254" + phone;
      if (phone.startsWith("254")) return phone;
      throw new Error("Invalid phone number format");
    };

    const phoneNumber = formatPhoneNumber(phone);
    const token = req.mpesaToken;

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "MPESA token missing",
      });
    }

    const timestamp =
      new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: safeAmount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "leemart investments",
        TransactionDesc: "Leemart Checkout",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { MerchantRequestID, CheckoutRequestID } = response.data;

    const mpesaTransaction = await MpesaTransaction.create({
      user: req.user?._id,
      orderId: order._id,
      merchantRequestID: MerchantRequestID,
      checkoutRequestID: CheckoutRequestID,
      phoneNumber,
      amount: safeAmount,
      status: "PENDING",
    });

    return res.status(200).json({
      checkoutRequestID: CheckoutRequestID,
      success: true,
      message: "STK Push Initiated",
      data: mpesaTransaction,
    });
  } catch (error) {
    console.error("STK ERROR FULL:", error?.response?.data || error.message);

    return res.status(400).json({
      success: false,
      message: error?.response?.data?.errorMessage || "STK Push failed",
      error: error?.response?.data || error.message,
    });
  }
};


export const mpesaCallback = async (req, res) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      return res.json({ ResultCode: 0, ResultDesc: "Callback received" });
    }

    const {
      merchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    const transaction = await MpesaTransaction.findOne({
      checkoutRequestID: CheckoutRequestID,
    });

    if (!transaction) {
      console.error(
        "Transaction not found for callback:",
        CheckoutRequestID
      );
      return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
    }

     // Prevent double processing
    if (transaction.status === "SUCCESS") {
      return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

     if (ResultCode !== 0) {
      if (transaction.orderId) {
        await MpesaOrder.findByIdAndUpdate(transaction.orderId, {
          paymentStatus: "FAILED",
        });
         transaction.status = "FAILED";
        transaction.resultCode = ResultCode;
         transaction.resultDesc = ResultDesc;
      }
     
      

      return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });

    }
  
    // ✅ Successful transaction
       const items = CallbackMetadata?.Item || [];

        ///const user = items.find(i => i.Name === "user._id,")?.Value;
        const amount = items.find(i => i.Name === "Amount")?.Value;
        const receipt = items.find(i => i.Name === "MpesaReceiptNumber")?.Value;
        const phoneNumber = items.find(i => i.Name === "PhoneNumber")?.Value;
        const date = items.find(i => i.Name === "TransactionDate")?.Value;

        ///transaction.user = user;
        transaction.amount = amount;
        transaction.phoneNumber = phoneNumber;
        transaction.mpesaReceiptNumber = receipt;
        transaction.transactionDate = date;
        transaction.resultCode = ResultCode;
        transaction.resultDesc = ResultDesc;
        transaction.status = "SUCCESS";
   
        await transaction.save();



        // ✅ AUTO-CONFIRM ORDER
    // ===============================
   // ✅ AUTO-CONFIRM ORDER (FIXED)
if (transaction.orderId) {
  const order = await MpesaOrder.findById(transaction.orderId);

  if (order && !order.isPaid) {
    order.isPaid = true;
    order.paymentStatus = "PAID";
    order.paidAt = new Date();

    order.paymentMethod = "MPESA";
    order.paymentReference = transaction.mpesaReceiptNumber;
    order.mpesaReceiptNumber = transaction.mpesaReceiptNumber;
    order.mpesaTransaction = transaction._id;

    await order.save();
  }
}

    return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
  } catch (error) {
    console.error("MPESA CALLBACK ERROR:", error);
    return res.json({ ResultCode: 0, ResultDesc: "Callback received" });
  }
};

export const getMyMpesaTransactions = async (req, res) => {
  try {
    const transactions = await MpesaTransaction.find({
      user: req.user?._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch MPESA transactions",
    });
  }
};

export const getAllMpesaTransactions = async (req, res) => {
  try {
    const transactions = await MpesaTransaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions:transactions || [] ,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch MPESA transactions",
    });
  }
};

// GET /api/mpesa/status/:checkoutRequestID
export const getMpesaStatus = async (req, res) => {
  const { checkoutRequestID } = req.params;

  const transaction = await MpesaTransaction.findOne({ checkoutRequestID });

  if (!transaction) {
    return res.status(404).json({ success: false });
  }

  res.json({
    success: true,
    status: transaction.status,
  });
};


