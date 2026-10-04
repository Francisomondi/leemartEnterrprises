import mongoose from "mongoose";

const mpesaOrderSchema =
  new mongoose.Schema(
    {
      /*
       * ======================================================
       * CUSTOMER
       * ======================================================
       */

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /*
       * ======================================================
       * ORDER ITEMS
       * ======================================================
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
           * Price snapshot at checkout.
           */
          price: {
            type: Number,
            required: true,
            min: 0,
          },

          /*
           * Variant snapshots.
           */
          size: {
            type: String,
            default: "",
            trim: true,
          },

          color: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],

      /*
       * ======================================================
       * PRICING
       * ======================================================
       */

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      /*
       * Coupon snapshot.
       *
       * Even after the coupon becomes inactive,
       * the order still remembers what was used.
       */
      coupon: {
        couponId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Coupon",
          default: null,
        },

        code: {
          type: String,
          default: null,
          trim: true,
        },

        discountPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      /*
       * ======================================================
       * PAYMENT
       * ======================================================
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
        enum: [
          "MPESA",
          "CARD",
        ],
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
        default: null,
      },

      /*
       * ======================================================
       * DELIVERY
       * ======================================================
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
       * ======================================================
       * M-PESA
       * ======================================================
       */

      mpesaTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MpesaTransaction",
      },

      mpesaReceiptNumber: {
        type: String,
        default: null,
        trim: true,
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

mpesaOrderSchema.index({
  user: 1,
  createdAt: -1,
});

mpesaOrderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

mpesaOrderSchema.index({
  user: 1,
  paymentStatus: 1,
  createdAt: -1,
});

const MpesaOrder =
  mongoose.model(
    "MpesaOrder",
    mpesaOrderSchema
  );

export default MpesaOrder;