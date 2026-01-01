// models/Order.js
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
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
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

    mpesaTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MpesaTransaction",
    },

    mpesaReceiptNumber: String,
  },
  { timestamps: true }
);

export default mongoose.model("MpesaOrder", mpesaOrderSchema);
