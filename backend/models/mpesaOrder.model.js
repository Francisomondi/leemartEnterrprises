// models/mpesaOrder.model.js
import mongoose from "mongoose";

const mpesaOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["MPESA"],
      default: "MPESA",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    paymentReference: {
      type: String,
    },

    mpesaTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MpesaTransaction",
    },

    mpesaReceiptNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MpesaOrder", mpesaOrderSchema);