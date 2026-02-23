// models/mpesaTransaction.model.js
import mongoose from "mongoose";

const mpesaTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ allow guest payments
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MpesaOrder",
      required: true, // ✅ every payment must belong to an order
    },

    merchantRequestID: {
      type: String,
      required: true,
    },

    checkoutRequestID: {
      type: String,
      required: true,
      index: true,
      unique: true, // ✅ prevents duplicate callbacks
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    resultCode: Number,
    resultDesc: String,

    mpesaReceiptNumber: {
      type: String,
    },

    transactionDate: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    rawCallback: {
      type: Object, // full callback payload (debugging & audits)
    },
  },
  { timestamps: true }
);

export default mongoose.model("MpesaTransaction", mpesaTransactionSchema);