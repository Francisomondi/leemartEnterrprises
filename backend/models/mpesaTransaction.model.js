// models/mpesaTransaction.model.js

import mongoose from "mongoose";

const mpesaTransactionSchema =
  new mongoose.Schema(
    {
      /*
       * ======================================================
       * USER
       * ======================================================
       */

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

        /*
         * Keep optional if guest payments may be
         * supported later.
         *
         * Current checkout flow is authenticated.
         */
        required: false,

        index: true,
      },

      /*
       * ======================================================
       * ORDER
       * ======================================================
       */

      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MpesaOrder",
        required: true,
        index: true,
      },

      /*
       * ======================================================
       * SAFARICOM REQUEST IDS
       * ======================================================
       */

      merchantRequestID: {
        type: String,
        required: true,
        trim: true,
      },

      checkoutRequestID: {
        type: String,
        required: true,
        trim: true,

        /*
         * Safaricom CheckoutRequestID should
         * uniquely identify one STK request.
         */
        unique: true,
        index: true,
      },

      /*
       * ======================================================
       * PAYMENT DETAILS
       * ======================================================
       */

      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },

      /*
       * Amount requested from M-PESA.
       *
       * IMPORTANT:
       *
       * This should originate from:
       *
       * MpesaOrder.totalAmount
       *
       * NOT from req.body.amount.
       */
      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      /*
       * ======================================================
       * CALLBACK RESULT
       * ======================================================
       */

      resultCode: {
        type: Number,
      },

      resultDesc: {
        type: String,
        trim: true,
      },

      /*
       * ======================================================
       * M-PESA RECEIPT
       * ======================================================
       *
       * Only successful transactions normally
       * have a receipt.
       *
       * sparse allows multiple documents without
       * this field while enforcing uniqueness when
       * the receipt exists.
       */

      mpesaReceiptNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
      },

      /*
       * ======================================================
       * TRANSACTION DATE
       * ======================================================
       */

      transactionDate: {
        type: Date,
      },

      /*
       * ======================================================
       * PAYMENT STATUS
       * ======================================================
       *
       * PENDING
       *   STK request sent / waiting.
       *
       * SUCCESS
       *   Payment confirmed and verified.
       *
       * FAILED
       *   Customer cancelled / payment failed.
       *
       * REVIEW
       *   Safaricom reports money received but
       *   something does not reconcile correctly.
       */

      status: {
        type: String,

        enum: [
          "PENDING",
          "SUCCESS",
          "FAILED",
          "REVIEW",
        ],

        default: "PENDING",

        index: true,
      },

      /*
       * ======================================================
       * RAW CALLBACK
       * ======================================================
       *
       * Keep the original Safaricom callback for:
       *
       * - debugging
       * - auditing
       * - reconciliation
       * - payment disputes
       */

      rawCallback: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    {
      timestamps: true,
    }
  );

/*
 * ============================================================
 * INDEXES
 * ============================================================
 */

mpesaTransactionSchema.index({
  orderId: 1,
  createdAt: -1,
});

mpesaTransactionSchema.index({
  user: 1,
  createdAt: -1,
});

mpesaTransactionSchema.index({
  status: 1,
  createdAt: -1,
});

/*
 * Useful when looking for recent pending
 * transactions for a particular order.
 */

mpesaTransactionSchema.index({
  orderId: 1,
  status: 1,
  createdAt: -1,
});

/*
 * ============================================================
 * MODEL
 * ============================================================
 */

const MpesaTransaction =
  mongoose.model(
    "MpesaTransaction",
    mpesaTransactionSchema
  );

export default MpesaTransaction;