import mongoose from "mongoose";

import MpesaOrder from "../models/mpesaOrder.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";

import {
  getDeliveryLocation,
} from "../config/deliveryLocations.js";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const normalizeSize = (value) =>
  String(value || "").trim();

const normalizeColor = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeCouponCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const roundMoney = (value) =>
  Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;

/*
 * ============================================================
 * CREATE M-PESA ORDER
 * ============================================================
 */

export const createMpesaOrder = async (req, res) => {
  try {
    /*
     * ========================================================
     * AUTHENTICATION
     * ========================================================
     */

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
     * ========================================================
     * REQUEST BODY
     * ========================================================
     *
     * Browser is allowed to send:
     *
     * - items
     * - couponCode
     * - delivery location
     * - phone number
     *
     * Browser DOES NOT control:
     *
     * - product price
     * - subtotal
     * - coupon percentage
     * - discount amount
     * - delivery fee
     * - total amount
     */

    const {
      items,
      couponCode,
      deliveryDetails,
    } = req.body;

    /*
     * ========================================================
     * VALIDATE ITEMS
     * ========================================================
     */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    /*
     * ========================================================
     * EXTRACT PRODUCT IDS
     * ========================================================
     */

    const productIds = items.map(
      (item) =>
        item?.product ||
        item?.productId ||
        item?._id
    );

    /*
     * ========================================================
     * VALIDATE PRODUCT IDS
     * ========================================================
     */

    const invalidProductId =
      productIds.some(
        (productId) =>
          !productId ||
          !mongoose.Types.ObjectId.isValid(
            productId
          )
      );

    if (invalidProductId) {
      return res.status(400).json({
        success: false,
        message:
          "One or more products are invalid",
      });
    }

    /*
     * ========================================================
     * FETCH PRODUCTS FROM DATABASE
     * ========================================================
     *
     * MongoDB is authoritative for price and variants.
     */

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    });

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    /*
     * ========================================================
     * BUILD TRUSTED ORDER ITEMS
     * ========================================================
     */

    const orderItems = [];

    for (const item of items) {
      const productId =
        item?.product ||
        item?.productId ||
        item?._id;

      const product =
        productMap.get(
          String(productId)
        );

      /*
       * Product may have been removed after
       * being added to the customer's cart.
       */

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "One or more products are no longer available",
        });
      }

      /*
       * ======================================================
       * QUANTITY
       * ======================================================
       */

      const quantity =
        Number(item?.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${product.name}`,
        });
      }

      /*
       * ======================================================
       * STOCK
       * ======================================================
       *
       * Only checked if this Product model actually
       * has a stock value.
       */

      if (
        product.stock !== undefined &&
        product.stock !== null &&
        Number(product.stock) < quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Only ${product.stock} item(s) of ${product.name} are available`,
        });
      }

      /*
       * ======================================================
       * SIZE
       * ======================================================
       */

      const selectedSize =
        normalizeSize(item?.size);

      const availableSizes =
        Array.isArray(product.sizes)
          ? product.sizes
              .map((size) =>
                normalizeSize(size)
              )
              .filter(Boolean)
          : [];

      /*
       * If the product has configured sizes,
       * a size must be selected.
       */

      if (availableSizes.length > 0) {
        if (!selectedSize) {
          return res.status(400).json({
            success: false,
            message:
              `Please select a size for ${product.name}`,
          });
        }

        if (
          !availableSizes.includes(
            selectedSize
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Size ${selectedSize} is not available for ${product.name}`,
          });
        }
      }

      /*
       * ======================================================
       * COLOR
       * ======================================================
       */

      const selectedColor =
        String(
          item?.color || ""
        ).trim();

      const availableColors =
        Array.isArray(product.colors)
          ? product.colors
              .map((color) =>
                String(
                  color || ""
                ).trim()
              )
              .filter(Boolean)
          : [];

      let finalColor =
        selectedColor;

      /*
       * If product has configured colors,
       * a color must be selected.
       */

      if (availableColors.length > 0) {
        if (!selectedColor) {
          return res.status(400).json({
            success: false,
            message:
              `Please select a color for ${product.name}`,
          });
        }

        /*
         * Compare colors case-insensitively.
         */

        const matchingColor =
          availableColors.find(
            (color) =>
              normalizeColor(color) ===
              normalizeColor(
                selectedColor
              )
          );

        if (!matchingColor) {
          return res.status(400).json({
            success: false,
            message:
              `Color ${selectedColor} is not available for ${product.name}`,
          });
        }

        /*
         * Store the canonical Product value.
         *
         * Example:
         *
         * Customer sends:
         *   "black"
         *
         * Product contains:
         *   "Black"
         *
         * Order stores:
         *   "Black"
         */

        finalColor =
          matchingColor;
      }

      /*
       * ======================================================
       * PRODUCT PRICE
       * ======================================================
       *
       * NEVER use item.price from the browser.
       */

      const price =
        Number(product.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid price for ${product.name}`,
        });
      }

      /*
       * ======================================================
       * ORDER ITEM SNAPSHOT
       * ======================================================
       */

      orderItems.push({
        product:
          product._id,

        quantity,

        price,

        size:
          selectedSize,

        color:
          finalColor,
      });
    }

    /*
     * ========================================================
     * SUBTOTAL
     * ========================================================
     *
     * Calculated exclusively from trusted database prices.
     */

    const subtotal =
      roundMoney(
        orderItems.reduce(
          (
            runningTotal,
            item
          ) =>
            runningTotal +
            Number(item.price) *
              Number(item.quantity),
          0
        )
      );

    /*
     * ========================================================
     * COUPON
     * ========================================================
     */

    let appliedCoupon =
      null;

    let discountPercentage =
      0;

    let discountAmount =
      0;

    const normalizedCouponCode =
      normalizeCouponCode(
        couponCode
      );

    /*
     * Coupon is optional.
     */

    if (normalizedCouponCode) {
      /*
       * Coupon MUST:
       *
       * - match the supplied code
       * - belong to authenticated user
       * - currently be active
       */

      const coupon =
        await Coupon.findOne({
          code:
            normalizedCouponCode,

          userId:
            req.user._id,

          isActive:
            true,
        });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon is invalid or no longer available",
        });
      }

      /*
       * ======================================================
       * EXPIRATION
       * ======================================================
       */

      if (
        coupon.expirationDate <
        new Date()
      ) {
        /*
         * Expired coupons are deactivated.
         */

        coupon.isActive =
          false;

        await coupon.save();

        return res.status(400).json({
          success: false,
          message:
            "Coupon has expired",
        });
      }

      /*
       * ======================================================
       * DISCOUNT PERCENTAGE
       * ======================================================
       *
       * Comes from MongoDB.
       *
       * Never use a percentage supplied by React.
       */

      discountPercentage =
        Number(
          coupon.discountPercentage
        );

      if (
        !Number.isFinite(
          discountPercentage
        ) ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon discount is invalid",
        });
      }

      /*
       * ======================================================
       * DISCOUNT AMOUNT
       * ======================================================
       */

      discountAmount =
        roundMoney(
          subtotal *
            (
              discountPercentage /
              100
            )
        );

      appliedCoupon =
        coupon;
    }

    /*
     * ========================================================
     * DISCOUNTED SUBTOTAL
     * ========================================================
     */

    const discountedSubtotal =
      roundMoney(
        Math.max(
          0,
          subtotal -
            discountAmount
        )
      );

    /*
     * ========================================================
     * DELIVERY LOCATION
     * ========================================================
     */

    const requestedLocation =
      String(
        deliveryDetails?.location ||
          ""
      ).trim();

    if (!requestedLocation) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery location is required",
      });
    }

    /*
     * Resolve delivery location from
     * SERVER configuration.
     */

    const selectedDeliveryLocation =
      getDeliveryLocation(
        requestedLocation
      );

    if (
      !selectedDeliveryLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery location",
      });
    }

    /*
     * ========================================================
     * DELIVERY FEE
     * ========================================================
     *
     * Browser-provided deliveryFee is completely ignored.
     */

    const deliveryFee =
      Number(
        selectedDeliveryLocation.fee
      );

    if (
      !Number.isFinite(
        deliveryFee
      ) ||
      deliveryFee < 0
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid server delivery configuration",
      });
    }

    /*
     * ========================================================
     * FINAL TOTAL
     * ========================================================
     *
     * subtotal
     * - discount
     * + delivery
     */

    const totalAmount =
      roundMoney(
        discountedSubtotal +
          deliveryFee
      );

    /*
     * M-PESA payment must have a positive value.
     */

    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order total must be at least KES 1",
      });
    }

    /*
     * ========================================================
     * PHONE SNAPSHOT
     * ========================================================
     *
     * Actual M-PESA phone validation is still performed
     * by the M-PESA controller.
     */

    const phoneNumber =
      String(
        deliveryDetails
          ?.phoneNumber || ""
      ).trim();

    /*
     * ========================================================
     * CREATE ORDER
     * ========================================================
     */

    const order =
      await MpesaOrder.create({
        user:
          req.user._id,

        items:
          orderItems,

        /*
         * ====================================================
         * PRICING SNAPSHOT
         * ====================================================
         */

        subtotal,

        discountAmount,

        coupon:
          appliedCoupon
            ? {
                couponId:
                  appliedCoupon._id,

                code:
                  appliedCoupon.code,

                discountPercentage,
              }
            : {
                couponId:
                  null,

                code:
                  null,

                discountPercentage:
                  0,
              },

        totalAmount,

        /*
         * ====================================================
         * DELIVERY SNAPSHOT
         * ====================================================
         */

        deliveryDetails: {
          location:
            selectedDeliveryLocation.name,

          deliveryFee,

          phoneNumber,
        },

        /*
         * ====================================================
         * PAYMENT
         * ====================================================
         */

        paymentMethod:
          "MPESA",

        paymentStatus:
          "PENDING",

        isPaid:
          false,
      });

    /*
     * ========================================================
     * IMPORTANT
     * ========================================================
     *
     * DO NOT deactivate the coupon here.
     *
     * Creating an order does not mean the customer
     * completed the M-PESA payment.
     *
     * Coupon consumption occurs only after a verified
     * successful M-PESA callback.
     */

    return res.status(201).json({
      success: true,
      message:
        "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "CREATE M-PESA ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create order",
    });
  }
};

/*
 * ============================================================
 * GET SUCCESSFUL ORDERS
 * ============================================================
 */

export const getSuccessfulOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await MpesaOrder.find({
        paymentStatus:
          "PAID",
      })
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product",
          "name price images category sizes colors"
        )
        .populate(
          "coupon.couponId",
          "code discountPercentage expirationDate isActive"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        orders.length,
      orders:
        orders || [],
    });
  } catch (error) {
    console.error(
      "GET SUCCESSFUL ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch orders",
    });
  }
};

/*
 * ============================================================
 * GET ORDER BY ID
 * ============================================================
 */

export const getOrderById = async (
  req,
  res
) => {
  try {
    /*
     * Validate ID before Mongoose attempts
     * to cast it.
     */

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await MpesaOrder.findById(
        req.params.id
      )
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product",
          "name price images category sizes colors"
        )
        .populate(
          "coupon.couponId",
          "code discountPercentage expirationDate isActive"
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
     * SECURITY
     * ========================================================
     *
     * Admin:
     *   can view any order.
     *
     * Customer:
     *   can view only own order.
     */

    const orderUserId =
      order.user?._id
        ? String(
            order.user._id
          )
        : String(
            order.user
          );

    const currentUserId =
      String(
        req.user._id
      );

    if (
      req.user.role !==
        "admin" &&
      orderUserId !==
        currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch order",
    });
  }
};

/*
 * ============================================================
 * GET CURRENT USER ORDERS
 * ============================================================
 */

export const getMyOrders = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const orders =
      await MpesaOrder.find({
        user:
          req.user._id,
      })
        .populate(
          "items.product",
          "name price images category sizes colors"
        )
        .populate(
          "coupon.couponId",
          "code discountPercentage expirationDate isActive"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        orders.length,
      orders:
        orders || [],
    });
  } catch (error) {
    console.error(
      "GET MY ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch orders",
    });
  }
};