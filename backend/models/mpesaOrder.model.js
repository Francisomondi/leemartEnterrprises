// models/mpesaOrder.model.js

import mongoose from "mongoose";

const mpesaOrderSchema = new mongoose.Schema(
  {
    /*
     * ========================================================
     * CUSTOMER
     * ========================================================
     */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * ========================================================
     * ORDER ITEMS
     * ========================================================
     *
     * IMPORTANT:
     *
     * size, color and price are stored as snapshots.
     *
     * Even if the Product is edited later, the order still
     * remembers exactly what the customer purchased.
     */

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
          min: 1,
        },

        /*
         * Price at the time the order was placed.
         */
        price: {
          type: Number,
          required: true,
          min: 0,
        },

        /*
         * Selected product size.
         *
         * Empty string is valid for products
         * without sizes.
         */
        size: {
          type: String,
          default: "",
          trim: true,
        },

        /*
         * Selected product color.
         *
         * Empty string is valid for products
         * without colors.
         */
        color: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    /*
     * ========================================================
     * ORDER TOTAL
     * ========================================================
     */

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * ========================================================
     * PAYMENT
     * ========================================================
     */

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["MPESA", "CARD"],
      default: "MPESA",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
      ],
      default: "PENDING",
      index: true,
    },

    paymentReference: {
      type: String,
    },

    /*
     * ========================================================
     * DELIVERY
     * ========================================================
     */

    deliveryDetails: {
      location: {
        type: String,
        default: "",
        trim: true,
      },

      deliveryFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      phoneNumber: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /*
     * ========================================================
     * M-PESA TRANSACTION
     * ========================================================
     */

    mpesaTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MpesaTransaction",
    },

    mpesaReceiptNumber: {
      type: String,
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
 *
 * Helps customer/admin order history queries.
 */

mpesaOrderSchema.index({
  user: 1,
  createdAt: -1,
});

mpesaOrderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

const MpesaOrder = mongoose.model(
  "MpesaOrder",
  mpesaOrderSchema
);

export default MpesaOrder;