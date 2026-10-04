import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";

import MpesaTransaction from "../models/mpesaTransaction.model.js";
import MpesaOrder from "../models/mpesaOrder.model.js";

dotenv.config();

/*
 * ============================================================
 * M-PESA CONFIG
 * ============================================================
 */

const shortcode =
  process.env.MPESA_SHORTCODE;

const passkey =
  process.env.MPESA_PASSKEY;

const callbackUrl =
  process.env.MPESA_CALLBACK_URL;

const consumerKey =
  process.env.MPESA_CONSUMER_KEY;

const consumerSecret =
  process.env.MPESA_CONSUMER_SECRET;

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const normalizePhoneNumber = (value) => {
  let phone = String(value || "")
    .replace(/\s+/g, "")
    .trim();

  if (phone.startsWith("+254")) {
    phone = phone.slice(1);
  }

  if (phone.startsWith("0")) {
    phone = `254${phone.slice(1)}`;
  } else if (
    phone.startsWith("7") ||
    phone.startsWith("1")
  ) {
    phone = `254${phone}`;
  }

  /*
   * Kenyan mobile number:
   *
   * 2547XXXXXXXX
   * 2541XXXXXXXX
   */

  if (!/^254(7|1)\d{8}$/.test(phone)) {
    throw new Error(
      "Invalid phone number format"
    );
  }

  return phone;
};

/*
 * M-PESA expects:
 *
 * YYYYMMDDHHmmss
 */

const generateTimestamp = () => {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const seconds =
    String(
      now.getSeconds()
    ).padStart(2, "0");

  return (
    year +
    month +
    day +
    hours +
    minutes +
    seconds
  );
};

/*
 * Convert:
 *
 * 20261004223045
 *
 * into a JavaScript Date.
 */

const parseMpesaTransactionDate = (
  value
) => {
  const dateString =
    String(value || "");

  if (
    !/^\d{14}$/.test(
      dateString
    )
  ) {
    return null;
  }

  const year =
    Number(
      dateString.slice(0, 4)
    );

  const month =
    Number(
      dateString.slice(4, 6)
    ) - 1;

  const day =
    Number(
      dateString.slice(6, 8)
    );

  const hour =
    Number(
      dateString.slice(8, 10)
    );

  const minute =
    Number(
      dateString.slice(10, 12)
    );

  const second =
    Number(
      dateString.slice(12, 14)
    );

  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    second
  );
};

/*
 * ============================================================
 * GENERATE M-PESA ACCESS TOKEN
 * ============================================================
 */

export const generateToken = async (
  req,
  res,
  next
) => {
  try {
    if (
      !consumerKey ||
      !consumerSecret
    ) {
      console.error(
        "MPESA Consumer Key/Secret missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "M-PESA production credentials are missing",
      });
    }

    const auth =
      Buffer.from(
        `${consumerKey}:${consumerSecret}`
      ).toString("base64");

    const response =
      await axios.get(
        "https://api.safaricom.co.ke/oauth/v1/generate",
        {
          params: {
            grant_type:
              "client_credentials",
          },

          headers: {
            Authorization:
              `Basic ${auth}`,

            Accept:
              "application/json",
          },

          timeout: 15000,
        }
      );

    const token =
      response.data
        ?.access_token;

    if (!token) {
      console.error(
        "MPESA TOKEN NOT RETURNED:",
        response.data
      );

      return res.status(500).json({
        success: false,
        message:
          "Safaricom did not return an access token",
      });
    }

    req.mpesaToken =
      token;

    console.log(
      "MPESA PRODUCTION TOKEN GENERATED"
    );

    return next();
  } catch (error) {
    console.error(
      "MPESA TOKEN ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,

      message:
        "Token generation failed",

      error:
        error.response?.data ||
        error.message,
    });
  }
};

/*
 * ============================================================
 * STK PUSH
 * ============================================================
 *
 * IMPORTANT:
 *
 * The client DOES NOT control the amount.
 *
 * Request body:
 *
 * {
 *   phone,
 *   orderId
 * }
 *
 * The amount comes from:
 *
 * MpesaOrder.totalAmount
 */

export const stkPush = async (
  req,
  res
) => {
  try {
    const {
      phone,
      orderId,
    } = req.body;

    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!phone || !orderId) {
      return res.status(400).json({
        success: false,
        message:
          "Phone and orderId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid orderId. Order must be created first.",
      });
    }

    /*
     * ========================================================
     * FIND ORDER
     * ========================================================
     */

    const order =
      await MpesaOrder.findById(
        orderId
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    /*
     * ========================================================
     * OWNERSHIP CHECK
     * ========================================================
     *
     * A customer cannot initiate payment
     * for another customer's order.
     */

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      String(order.user) !==
      String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to pay for this order",
      });
    }

    /*
     * ========================================================
     * ORDER PAYMENT STATE
     * ========================================================
     */

    if (
      order.isPaid ||
      order.paymentStatus ===
        "PAID"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This order has already been paid",
      });
    }

    /*
     * A failed order should normally not be
     * silently reused.
     *
     * The customer can create a new order.
     */

    if (
      order.paymentStatus ===
      "FAILED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This order has already failed. Please create a new order.",
      });
    }

    /*
     * ========================================================
     * SERVER-CONTROLLED AMOUNT
     * ========================================================
     */

    const safeAmount =
      Number(
        order.totalAmount
      );

    if (
      !Number.isFinite(
        safeAmount
      ) ||
      safeAmount < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order has an invalid total amount",
      });
    }

    /*
     * M-PESA uses whole KES.
     *
     * If all your product/delivery prices are
     * whole KES this does not change anything.
     */

    const mpesaAmount =
      Math.round(safeAmount);

    /*
     * ========================================================
     * PHONE
     * ========================================================
     */

    let phoneNumber;

    try {
      phoneNumber =
        normalizePhoneNumber(
          phone
        );
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid Kenyan M-PESA phone number",
      });
    }

    /*
     * ========================================================
     * TOKEN
     * ========================================================
     */

    const token =
      req.mpesaToken;

    if (!token) {
      return res.status(500).json({
        success: false,
        message:
          "M-PESA token missing",
      });
    }

    /*
     * ========================================================
     * CONFIG CHECK
     * ========================================================
     */

    if (
      !shortcode ||
      !passkey ||
      !callbackUrl
    ) {
      console.error(
        "M-PESA STK configuration missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "M-PESA configuration is incomplete",
      });
    }

    /*
     * ========================================================
     * TIMESTAMP + PASSWORD
     * ========================================================
     */

    const timestamp =
      generateTimestamp();

    const password =
      Buffer.from(
        `${shortcode}${passkey}${timestamp}`
      ).toString("base64");

    /*
     * ========================================================
     * STK REQUEST
     * ========================================================
     */

    const response =
      await axios.post(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",

        {
          BusinessShortCode:
            shortcode,

          Password:
            password,

          Timestamp:
            timestamp,

          TransactionType:
            "CustomerPayBillOnline",

          /*
           * IMPORTANT:
           *
           * Comes from order.totalAmount.
           */

          Amount:
            mpesaAmount,

          PartyA:
            phoneNumber,

          PartyB:
            shortcode,

          PhoneNumber:
            phoneNumber,

          CallBackURL:
            callbackUrl,

          /*
           * Using part of the order ID
           * makes reconciliation easier.
           */

          AccountReference:
            `LEEMART-${String(
              order._id
            ).slice(-8)}`,

          TransactionDesc:
            "Leemart Checkout",
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          timeout: 20000,
        }
      );

    /*
     * ========================================================
     * SAFARICOM RESPONSE
     * ========================================================
     */

    const {
      MerchantRequestID,
      CheckoutRequestID,
    } = response.data;

    if (
      !MerchantRequestID ||
      !CheckoutRequestID
    ) {
      console.error(
        "INVALID STK RESPONSE:",
        response.data
      );

      return res.status(502).json({
        success: false,
        message:
          "Invalid response from M-PESA",
      });
    }

    /*
     * ========================================================
     * SAVE TRANSACTION
     * ========================================================
     */

    const mpesaTransaction =
      await MpesaTransaction.create({
        user:
          req.user._id,

        orderId:
          order._id,

        merchantRequestID:
          MerchantRequestID,

        checkoutRequestID:
          CheckoutRequestID,

        phoneNumber,

        /*
         * Store the amount requested
         * from M-PESA.
         */

        amount:
          mpesaAmount,

        status:
          "PENDING",
      });

    /*
     * Link transaction to order immediately.
     *
     * Previously this happened only after
     * successful callback.
     */

    order.mpesaTransaction =
      mpesaTransaction._id;

    await order.save();

    /*
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    return res.status(200).json({
      success: true,

      message:
        "STK Push Initiated",

      checkoutRequestID:
        CheckoutRequestID,

      /*
       * Useful for confirming what
       * amount the server actually used.
       */

      amount:
        mpesaAmount,

      orderId:
        order._id,

      data:
        mpesaTransaction,
    });
  } catch (error) {
    console.error(
      "STK ERROR FULL:",
      error?.response?.data ||
        error.message
    );

    return res.status(400).json({
      success: false,

      message:
        error?.response?.data
          ?.errorMessage ||
        error.message ||
        "STK Push failed",

      error:
        error?.response?.data ||
        error.message,
    });
  }
};

/*
 * ============================================================
 * M-PESA CALLBACK
 * ============================================================
 */

export const mpesaCallback = async (
  req,
  res
) => {
  try {
    const stkCallback =
      req.body?.Body
        ?.stkCallback;

    /*
     * Always acknowledge Safaricom.
     */

    if (!stkCallback) {
      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback received",
      });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    /*
     * ========================================================
     * FIND TRANSACTION
     * ========================================================
     */

    const transaction =
      await MpesaTransaction.findOne({
        checkoutRequestID:
          CheckoutRequestID,
      });

    if (!transaction) {
      console.error(
        "Transaction not found for callback:",
        CheckoutRequestID
      );

      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback processed",
      });
    }

    /*
     * ========================================================
     * IDEMPOTENCY
     * ========================================================
     *
     * Safaricom can retry callbacks.
     */

    if (
      transaction.status ===
      "SUCCESS"
    ) {
      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Already processed",
      });
    }

    /*
     * ========================================================
     * FAILED / CANCELLED PAYMENT
     * ========================================================
     */

    if (
      Number(ResultCode) !== 0
    ) {
      transaction.status =
        "FAILED";

      transaction.resultCode =
        ResultCode;

      transaction.resultDesc =
        ResultDesc;

      await transaction.save();

      if (
        transaction.orderId
      ) {
        await MpesaOrder.findByIdAndUpdate(
          transaction.orderId,
          {
            paymentStatus:
              "FAILED",
          }
        );
      }

      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback processed",
      });
    }

    /*
     * ========================================================
     * SUCCESSFUL CALLBACK METADATA
     * ========================================================
     */

    const items =
      CallbackMetadata?.Item ||
      [];

    const getMetadataValue = (
      name
    ) =>
      items.find(
        (item) =>
          item.Name === name
      )?.Value;

    const paidAmount =
      Number(
        getMetadataValue(
          "Amount"
        )
      );

    const receipt =
      getMetadataValue(
        "MpesaReceiptNumber"
      );

    const phoneNumber =
      getMetadataValue(
        "PhoneNumber"
      );

    const transactionDate =
      getMetadataValue(
        "TransactionDate"
      );

    /*
     * ========================================================
     * FIND ASSOCIATED ORDER
     * ========================================================
     */

    let order = null;

    if (
      transaction.orderId
    ) {
      order =
        await MpesaOrder.findById(
          transaction.orderId
        );
    }

    if (!order) {
      console.error(
        "M-PESA SUCCESS CALLBACK HAS NO VALID ORDER:",
        {
          checkoutRequestID:
            CheckoutRequestID,

          orderId:
            transaction.orderId,
        }
      );

      /*
       * Don't mark the transaction SUCCESS
       * if we cannot associate the payment
       * with an order.
       */

      transaction.resultCode =
        ResultCode;

      transaction.resultDesc =
        "Payment received but order could not be found";

      await transaction.save();

      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback processed",
      });
    }

    /*
     * ========================================================
     * VERIFY AMOUNT
     * ========================================================
     *
     * Never mark an order paid merely because
     * ResultCode === 0.
     *
     * The amount returned by M-PESA must match
     * the amount expected for the order.
     */

    const expectedAmount =
      Math.round(
        Number(
          order.totalAmount
        )
      );

    if (
      !Number.isFinite(
        paidAmount
      ) ||
      paidAmount !==
        expectedAmount
    ) {
      console.error(
        "M-PESA PAYMENT AMOUNT MISMATCH:",
        {
          orderId:
            order._id,

          expected:
            expectedAmount,

          received:
            paidAmount,

          checkoutRequestID:
            CheckoutRequestID,
        }
      );

      /*
       * Keep transaction details for
       * manual reconciliation.
       *
       * Do NOT mark the order PAID.
       */

      transaction.amount =
        paidAmount;

      transaction.phoneNumber =
        phoneNumber;

      transaction.mpesaReceiptNumber =
        receipt;

      transaction.resultCode =
        ResultCode;

      transaction.resultDesc =
        `Amount mismatch. Expected ${expectedAmount}, received ${paidAmount}`;

      transaction.status =
        "FAILED";

      const parsedDate =
        parseMpesaTransactionDate(
          transactionDate
        );

      if (parsedDate) {
        transaction.transactionDate =
          parsedDate;
      }

      await transaction.save();

      order.paymentStatus =
        "FAILED";

      await order.save();

      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback processed",
      });
    }

    /*
     * ========================================================
     * VALIDATE RECEIPT
     * ========================================================
     */

    if (!receipt) {
      console.error(
        "M-PESA SUCCESS CALLBACK WITHOUT RECEIPT:",
        CheckoutRequestID
      );

      transaction.resultCode =
        ResultCode;

      transaction.resultDesc =
        "Successful callback without receipt number";

      await transaction.save();

      return res.json({
        ResultCode: 0,
        ResultDesc:
          "Callback processed",
      });
    }

    /*
     * ========================================================
     * UPDATE TRANSACTION
     * ========================================================
     */

    transaction.amount =
      paidAmount;

    transaction.phoneNumber =
      phoneNumber;

    transaction.mpesaReceiptNumber =
      receipt;

    transaction.resultCode =
      ResultCode;

    transaction.resultDesc =
      ResultDesc;

    transaction.status =
      "SUCCESS";

    const parsedDate =
      parseMpesaTransactionDate(
        transactionDate
      );

    if (parsedDate) {
      transaction.transactionDate =
        parsedDate;
    }

    await transaction.save();

    /*
     * ========================================================
     * AUTO-CONFIRM ORDER
     * ========================================================
     */

    if (!order.isPaid) {
      order.isPaid = true;

      order.paymentStatus =
        "PAID";

      order.paidAt =
        new Date();

      order.paymentMethod =
        "MPESA";

      order.paymentReference =
        receipt;

      order.mpesaReceiptNumber =
        receipt;

      order.mpesaTransaction =
        transaction._id;

      await order.save();
    }

    console.log(
      "M-PESA PAYMENT CONFIRMED:",
      {
        orderId:
          order._id,

        receipt,

        amount:
          paidAmount,
      }
    );

    return res.json({
      ResultCode: 0,

      ResultDesc:
        "Callback processed",
    });
  } catch (error) {
    /*
     * Safaricom should still receive an
     * acknowledgement so it doesn't keep
     * retrying indefinitely.
     */

    console.error(
      "MPESA CALLBACK ERROR:",
      error
    );

    return res.json({
      ResultCode: 0,
      ResultDesc:
        "Callback received",
    });
  }
};

/*
 * ============================================================
 * GET MY M-PESA TRANSACTIONS
 * ============================================================
 */

export const getMyMpesaTransactions = async (
  req,
  res
) => {
  try {
    const transactions =
      await MpesaTransaction.find({
        user:
          req.user?._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      transactions:
        transactions || [],
    });
  } catch (error) {
    console.error(
      "GET MY M-PESA TRANSACTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch MPESA transactions",
    });
  }
};

/*
 * ============================================================
 * GET ALL M-PESA TRANSACTIONS
 * ============================================================
 */

export const getAllMpesaTransactions = async (
  req,
  res
) => {
  try {
    const transactions =
      await MpesaTransaction.find()
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "orderId",
          "totalAmount paymentStatus isPaid"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      transactions:
        transactions || [],
    });
  } catch (error) {
    console.error(
      "GET ALL M-PESA TRANSACTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch MPESA transactions",
    });
  }
};

/*
 * ============================================================
 * GET M-PESA STATUS
 * ============================================================
 *
 * GET /api/mpesa/status/:checkoutRequestID
 */

export const getMpesaStatus = async (
  req,
  res
) => {
  try {
    const {
      checkoutRequestID,
    } = req.params;

    if (
      !checkoutRequestID
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Checkout request ID is required",
      });
    }

    const transaction =
      await MpesaTransaction.findOne({
        checkoutRequestID,
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "Transaction not found",
      });
    }

    /*
     * SECURITY:
     *
     * If this endpoint is protected,
     * don't let another customer inspect
     * somebody else's transaction.
     */

    if (
      req.user?._id &&
      transaction.user &&
      String(
        transaction.user
      ) !==
        String(
          req.user._id
        ) &&
      req.user.role !==
        "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized",
      });
    }

    return res.json({
      success: true,

      status:
        transaction.status,

      orderId:
        transaction.orderId,
    });
  } catch (error) {
    console.error(
      "GET M-PESA STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to check payment status",
    });
  }
};