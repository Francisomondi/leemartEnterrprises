import mongoose from "mongoose";

const mpesaTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    mpesaReceiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    checkoutRequestID: {
      type: String,
      required: true,
    },

    merchantRequestID: {
      type: String,
      required: true,
    },

    resultCode: {
      type: Number,
      required: true,
    },

    resultDesc: {
      type: String,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MpesaTransaction", mpesaTransactionSchema);
