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

/*
 * Convert supported Kenyan formats to:
 *
 * 0712345678
 *      ↓
 * 254712345678
 *
 * 712345678
 *      ↓
 * 254712345678
 *
 * +254712345678
 *      ↓
 * 254712345678
 */

const normalizePhoneNumber = (
  value
) => {
  let phone = String(
    value || ""
  )
    .replace(/\s+/g, "")
    .trim();

  /*
   * Remove +
   */

  if (
    phone.startsWith("+254")
  ) {
    phone =
      phone.slice(1);
  }

  /*
   * 07XXXXXXXX
   * 01XXXXXXXX
   */

  if (
    phone.startsWith("0")
  ) {
    phone =
      `254${phone.slice(1)}`;
  }

  /*
   * 7XXXXXXXX
   * 1XXXXXXXX
   */

  else if (
    phone.startsWith("7") ||
    phone.startsWith("1")
  ) {
    phone =
      `254${phone}`;
  }

  /*
   * Final accepted format:
   *
   * 2547XXXXXXXX
   * 2541XXXXXXXX
   */

  if (
    !/^254(7|1)\d{8}$/.test(
      phone
    )
  ) {
    throw new Error(
      "Invalid phone number format"
    );
  }

  return phone;
};

/*
 * ============================================================
 * M-PESA TIMESTAMP
 * ============================================================
 *
 * Format:
 *
 * YYYYMMDDHHmmss
 */

const generateTimestamp = () => {
  const now =
    new Date();

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
 * ============================================================
 * PARSE M-PESA TRANSACTION DATE
 * ============================================================
 *
 * Safaricom:
 *
 * 20261004223045
 *
 * becomes a JavaScript Date.
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
      dateString.slice(
        0,
        4
      )
    );

  const month =
    Number(
      dateString.slice(
        4,
        6
      )
    ) - 1;

  const day =
    Number(
      dateString.slice(
        6,
        8
      )
    );

  const hour =
    Number(
      dateString.slice(
        8,
        10
      )
    );

  const minute =
    Number(
      dateString.slice(
        10,
        12
      )
    );

  const second =
    Number(
      dateString.slice(
        12,
        14
      )
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
 * GET CALLBACK METADATA
 * ============================================================
 */

const getCallbackValue = (
  items,
  name
) => {
  if (
    !Array.isArray(items)
  ) {
    return undefined;
  }

  return items.find(
    (item) =>
      item?.Name === name
  )?.Value;
};

/*
 * ============================================================
 * GENERATE M-PESA ACCESS TOKEN
 * ============================================================
 */

export const generateToken =
  async (
    req,
    res,
    next
  ) => {
    try {
      /*
       * Validate credentials.
       */

      if (
        !consumerKey ||
        !consumerSecret
      ) {
        console.error(
          "MPESA Consumer Key/Secret missing"
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "M-PESA production credentials are missing",
          });
      }

      /*
       * Basic authorization.
       */

      const auth =
        Buffer.from(
          `${consumerKey}:${consumerSecret}`
        ).toString(
          "base64"
        );

      /*
       * Request token.
       */

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

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Safaricom did not return an access token",
          });
      }

      /*
       * Pass token to next middleware/controller.
       */

      req.mpesaToken =
        token;

      console.log(
        "MPESA PRODUCTION TOKEN GENERATED"
      );

      return next();
    } catch (error) {
      console.error(
        "MPESA TOKEN ERROR:",
        error.response
          ?.data ||
          error.message
      );

      console.error(
        "MPESA TOKEN STATUS:",
        error.response
          ?.status
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Token generation failed",

          error:
            error.response
              ?.data ||
            error.message,
        });
    }
  };

/*
 * ============================================================
 * STK PUSH
 * ============================================================
 *
 * POST /api/mpesa/stk
 *
 * Frontend sends ONLY:
 *
 * {
 *   phone,
 *   orderId
 * }
 *
 * It DOES NOT control the amount.
 *
 * Amount comes from:
 *
 * MpesaOrder.totalAmount
 */

export const stkPush =
  async (
    req,
    res
  ) => {
    try {
      const {
        phone,
        orderId,
      } = req.body;

      /*
       * ======================================================
       * BASIC VALIDATION
       * ======================================================
       */

      if (
        !phone ||
        !orderId
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Phone and orderId are required",
          });
      }

      /*
       * ======================================================
       * AUTHENTICATION
       * ======================================================
       */

      if (!req.user?._id) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }

      /*
       * ======================================================
       * VALIDATE ORDER ID
       * ======================================================
       */

      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid orderId. Order must be created first.",
          });
      }

      /*
       * ======================================================
       * FIND ORDER
       * ======================================================
       */

      const order =
        await MpesaOrder.findById(
          orderId
        );

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Order not found",
          });
      }

      /*
       * ======================================================
       * ORDER OWNERSHIP
       * ======================================================
       */

      if (
        String(order.user) !==
        String(req.user._id)
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "You are not authorized to pay for this order",
          });
      }

      /*
       * ======================================================
       * ALREADY PAID
       * ======================================================
       */

      if (
        order.isPaid ||
        order.paymentStatus ===
          "PAID"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "This order has already been paid",
          });
      }

      /*
       * ======================================================
       * FAILED ORDER
       * ======================================================
       */

      if (
        order.paymentStatus ===
        "FAILED"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "This order has already failed. Please create a new order.",
          });
      }

      /*
       * ======================================================
       * SERVER-CONTROLLED AMOUNT
       * ======================================================
       */

      const orderAmount =
        Number(
          order.totalAmount
        );

      if (
        !Number.isFinite(
          orderAmount
        ) ||
        orderAmount < 1
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Order has an invalid total amount",
          });
      }

      /*
       * M-PESA uses whole KES.
       */

      const mpesaAmount =
        Math.round(
          orderAmount
        );

      /*
       * ======================================================
       * PHONE
       * ======================================================
       */

      let phoneNumber;

      try {
        phoneNumber =
          normalizePhoneNumber(
            phone
          );
      } catch {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Enter a valid Kenyan M-PESA phone number",
          });
      }

      /*
       * ======================================================
       * PREVENT DUPLICATE STK REQUESTS
       * ======================================================
       *
       * A recent pending request means the customer
       * probably already has an STK prompt on their phone.
       *
       * We allow another attempt after five minutes.
       */

      const fiveMinutesAgo =
        new Date(
          Date.now() -
            5 *
              60 *
              1000
        );

      const existingPendingTransaction =
        await MpesaTransaction.findOne(
          {
            orderId:
              order._id,

            status:
              "PENDING",

            createdAt: {
              $gte:
                fiveMinutesAgo,
            },
          }
        ).sort({
          createdAt: -1,
        });

      if (
        existingPendingTransaction
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "A payment request for this order is already pending. Complete the M-PESA prompt or wait before trying again.",

            checkoutRequestID:
              existingPendingTransaction.checkoutRequestID,
          });
      }

      /*
       * ======================================================
       * TOKEN
       * ======================================================
       */

      const token =
        req.mpesaToken;

      if (!token) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "M-PESA token missing",
          });
      }

      /*
       * ======================================================
       * CONFIGURATION
       * ======================================================
       */

      if (
        !shortcode ||
        !passkey ||
        !callbackUrl
      ) {
        console.error(
          "M-PESA STK configuration missing"
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "M-PESA configuration is incomplete",
          });
      }

      /*
       * ======================================================
       * TIMESTAMP
       * ======================================================
       */

      const timestamp =
        generateTimestamp();

      /*
       * ======================================================
       * PASSWORD
       * ======================================================
       */

      const password =
        Buffer.from(
          `${shortcode}${passkey}${timestamp}`
        ).toString(
          "base64"
        );

      /*
       * ======================================================
       * CALL SAFARICOM
       * ======================================================
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
             * SERVER amount.
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
             * Helpful when reconciling payments.
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
       * ======================================================
       * SAFARICOM RESPONSE
       * ======================================================
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

        return res
          .status(502)
          .json({
            success: false,

            message:
              "Invalid response from M-PESA",
          });
      }

      /*
       * ======================================================
       * CREATE TRANSACTION
       * ======================================================
       */

      const mpesaTransaction =
        await MpesaTransaction.create(
          {
            user:
              req.user._id,

            orderId:
              order._id,

            merchantRequestID:
              MerchantRequestID,

            checkoutRequestID:
              CheckoutRequestID,

            phoneNumber,

            amount:
              mpesaAmount,

            status:
              "PENDING",
          }
        );

      /*
       * ======================================================
       * LINK TRANSACTION TO ORDER
       * ======================================================
       */

      order.mpesaTransaction =
        mpesaTransaction._id;

      await order.save();

      /*
       * ======================================================
       * RESPONSE
       * ======================================================
       */

      return res
        .status(200)
        .json({
          success: true,

          message:
            "STK Push Initiated",

          checkoutRequestID:
            CheckoutRequestID,

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
        error?.response
          ?.data ||
          error.message
      );

      return res
        .status(400)
        .json({
          success: false,

          message:
            error?.response
              ?.data
              ?.errorMessage ||
            error.message ||
            "STK Push failed",

          error:
            error?.response
              ?.data ||
            error.message,
        });
    }
  };

/*
 * ============================================================
 * M-PESA CALLBACK
 * ============================================================
 */

export const mpesaCallback =
  async (
    req,
    res
  ) => {
    try {
      const stkCallback =
        req.body?.Body
          ?.stkCallback;

      /*
       * Safaricom callback may occasionally
       * arrive without expected payload.
       *
       * Acknowledge it.
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
       * ======================================================
       * FIND TRANSACTION
       * ======================================================
       */

      const transaction =
        await MpesaTransaction.findOne(
          {
            checkoutRequestID:
              CheckoutRequestID,
          }
        );

      if (!transaction) {
        console.error(
          "Transaction not found for callback:",
          CheckoutRequestID
        );

        /*
         * Still acknowledge Safaricom.
         */

        return res.json({
          ResultCode: 0,

          ResultDesc:
            "Callback processed",
        });
      }

      /*
       * ======================================================
       * PRESERVE RAW CALLBACK
       * ======================================================
       */

      transaction.rawCallback =
        req.body;

      /*
       * ======================================================
       * IDEMPOTENCY
       * ======================================================
       *
       * Safaricom can send the callback more
       * than once.
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
       * ======================================================
       * FAILED / CANCELLED PAYMENT
       * ======================================================
       */

      if (
        Number(
          ResultCode
        ) !== 0
      ) {
        transaction.status =
          "FAILED";

        transaction.resultCode =
          Number(
            ResultCode
          );

        transaction.resultDesc =
          ResultDesc;

        await transaction.save();

        /*
         * Mark associated order failed.
         */

        if (
          transaction.orderId
        ) {
          const order =
            await MpesaOrder.findById(
              transaction.orderId
            );

          if (
            order &&
            !order.isPaid
          ) {
            order.paymentStatus =
              "FAILED";

            await order.save();
          }
        }

        return res.json({
          ResultCode: 0,

          ResultDesc:
            "Callback processed",
        });
      }

      /*
       * ======================================================
       * SUCCESS CALLBACK METADATA
       * ======================================================
       */

      const items =
        CallbackMetadata?.Item ||
        [];

      const paidAmount =
        Number(
          getCallbackValue(
            items,
            "Amount"
          )
        );

      const receipt =
        getCallbackValue(
          items,
          "MpesaReceiptNumber"
        );

      const phoneNumber =
        getCallbackValue(
          items,
          "PhoneNumber"
        );

      const transactionDate =
        getCallbackValue(
          items,
          "TransactionDate"
        );

      /*
       * ======================================================
       * FIND ORDER
       * ======================================================
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

      /*
       * ======================================================
       * ORDER MISSING
       * ======================================================
       *
       * M-PESA says money was received, but
       * we cannot find the associated order.
       *
       * This requires manual review.
       */

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

        transaction.resultCode =
          Number(
            ResultCode
          );

        transaction.resultDesc =
          "Payment received but associated order could not be found";

        transaction.status =
          "REVIEW";

        await transaction.save();

        return res.json({
          ResultCode: 0,

          ResultDesc:
            "Callback processed",
        });
      }

      /*
       * ======================================================
       * EXPECTED AMOUNT
       * ======================================================
       */

      const expectedAmount =
        Math.round(
          Number(
            order.totalAmount
          )
        );

      /*
       * ======================================================
       * AMOUNT MISMATCH
       * ======================================================
       *
       * Important:
       *
       * ResultCode 0 means Safaricom reports
       * a successful payment.
       *
       * Therefore a mismatched amount should
       * NOT be labelled as an ordinary FAILED
       * transaction.
       *
       * It requires REVIEW.
       */

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

        transaction.amount =
          Number.isFinite(
            paidAmount
          )
            ? paidAmount
            : transaction.amount;

        if (phoneNumber) {
          transaction.phoneNumber =
            String(
              phoneNumber
            );
        }

        if (receipt) {
          transaction.mpesaReceiptNumber =
            String(
              receipt
            );
        }

        transaction.resultCode =
          Number(
            ResultCode
          );

        transaction.resultDesc =
          `Amount mismatch. Expected ${expectedAmount}, received ${paidAmount}`;

        /*
         * Manual review required.
         */

        transaction.status =
          "REVIEW";

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
         * DO NOT mark this order PAID.
         *
         * Also don't mark it FAILED because
         * Safaricom says money was received.
         */

        order.isPaid =
          false;

        order.paymentStatus =
          "PENDING";

        await order.save();

        return res.json({
          ResultCode: 0,

          ResultDesc:
            "Callback processed",
        });
      }

      /*
       * ======================================================
       * RECEIPT VALIDATION
       * ======================================================
       */

      if (!receipt) {
        console.error(
          "M-PESA SUCCESS CALLBACK WITHOUT RECEIPT:",
          CheckoutRequestID
        );

        transaction.amount =
          paidAmount;

        if (phoneNumber) {
          transaction.phoneNumber =
            String(
              phoneNumber
            );
        }

        transaction.resultCode =
          Number(
            ResultCode
          );

        transaction.resultDesc =
          "Successful callback received without M-PESA receipt number";

        /*
         * Safaricom says successful but we cannot
         * safely confirm the payment without a
         * receipt.
         */

        transaction.status =
          "REVIEW";

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
         * Order remains unpaid.
         */

        order.isPaid =
          false;

        order.paymentStatus =
          "PENDING";

        await order.save();

        return res.json({
          ResultCode: 0,

          ResultDesc:
            "Callback processed",
        });
      }

      /*
       * ======================================================
       * SUCCESSFUL PAYMENT
       * ======================================================
       */

      transaction.amount =
        paidAmount;

      if (phoneNumber) {
        transaction.phoneNumber =
          String(
            phoneNumber
          );
      }

      transaction.mpesaReceiptNumber =
        String(
          receipt
        );

      transaction.resultCode =
        Number(
          ResultCode
        );

      transaction.resultDesc =
        ResultDesc;

      transaction.status =
        "SUCCESS";

      /*
       * Transaction date.
       */

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
       * ======================================================
       * AUTO-CONFIRM ORDER
       * ======================================================
       */

      if (!order.isPaid) {
        order.isPaid =
          true;

        order.paymentStatus =
          "PAID";

        order.paidAt =
          new Date();

        order.paymentMethod =
          "MPESA";

        order.paymentReference =
          String(
            receipt
          );

        order.mpesaReceiptNumber =
          String(
            receipt
          );

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
       * ======================================================
       * CALLBACK ERROR
       * ======================================================
       *
       * Log internally.
       *
       * We still acknowledge Safaricom to prevent
       * uncontrolled repeated callback delivery.
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

export const getMyMpesaTransactions =
  async (
    req,
    res
  ) => {
    try {
      if (!req.user?._id) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }

      const transactions =
        await MpesaTransaction.find(
          {
            user:
              req.user._id,
          }
        )
          .populate(
            "orderId",
            "totalAmount paymentStatus isPaid deliveryDetails"
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,

          count:
            transactions.length,

          transactions:
            transactions || [],
        });
    } catch (error) {
      console.error(
        "GET MY M-PESA TRANSACTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
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

export const getAllMpesaTransactions =
  async (
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
            "totalAmount paymentStatus isPaid deliveryDetails"
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,

          count:
            transactions.length,

          transactions:
            transactions ||
            [],
        });
    } catch (error) {
      console.error(
        "GET ALL M-PESA TRANSACTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
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

export const getMpesaStatus =
  async (
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
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Checkout request ID is required",
          });
      }

      const transaction =
        await MpesaTransaction.findOne(
          {
            checkoutRequestID,
          }
        );

      if (!transaction) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Transaction not found",
          });
      }

      /*
       * ======================================================
       * SECURITY
       * ======================================================
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
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Unauthorized",
          });
      }

      /*
       * ======================================================
       * RESPONSE
       * ======================================================
       */

      return res.json({
        success: true,

        status:
          transaction.status,

        orderId:
          transaction.orderId,

        /*
         * Don't expose unnecessary internal
         * callback data here.
         */

        resultDesc:
          transaction.resultDesc ||
          null,
      });
    } catch (error) {
      console.error(
        "GET M-PESA STATUS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to check payment status",
        });
    }
  };