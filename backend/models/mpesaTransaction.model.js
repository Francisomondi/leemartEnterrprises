import mongoose from "mongoose";

const mpesaTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // allow guest payments
    },
    merchantRequestID: { type: String },
    checkoutRequestID: { type: String, index: true },

    phoneNumber: { type: String, required: true },
    amount: { type: Number },

    resultCode: { type: Number },
    resultDesc: { type: String },

    mpesaReceiptNumber: { type: String },
    transactionDate: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    rawCallback: { type: Object }, // full callback for debugging
  },
  { timestamps: true }
);

export default mongoose.model("MpesaTransaction", mpesaTransactionSchema);
