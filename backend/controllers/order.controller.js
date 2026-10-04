import mongoose from "mongoose";

import MpesaOrder from "../models/mpesaOrder.model.js";
import Product from "../models/product.model.js";
import { getDeliveryLocation} from "../config/deliveryLocations.js";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const normalizeSize = (value) => {
  return String(value || "").trim();
};

const normalizeColor = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

/*
 * ============================================================
 * CREATE M-PESA ORDER
 * ============================================================
 */

export const createMpesaOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryDetails,
    } = req.body;

    /*
     * ========================================================
     * VALIDATE ORDER ITEMS
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
     *
     * Supports:
     *
     * {
     *   product: "..."
     * }
     *
     * {
     *   productId: "..."
     * }
     *
     * {
     *   _id: "..."
     * }
     */

    const productIds = items.map(
      (item) =>
        item.product ||
        item.productId ||
        item._id
    );

    /*
     * Validate MongoDB IDs.
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
     * Never trust prices sent from the browser.
     */

    const products =
      await Product.find({
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
        item.product ||
        item.productId ||
        item._id;

      const product =
        productMap.get(
          String(productId)
        );

      /*
       * Product may have been deleted after
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
        Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      /*
       * Optional stock validation.
       *
       * Your previous Product code allowed stock to be
       * undefined, so only enforce it when it exists.
       */

      if (
        product.stock !== undefined &&
        product.stock !== null &&
        Number(product.stock) <
          quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) of ${product.name} are available`,
        });
      }

      /*
       * ======================================================
       * SIZE
       * ======================================================
       */

      const selectedSize =
        normalizeSize(item.size);

      const availableSizes =
        Array.isArray(product.sizes)
          ? product.sizes
              .map((size) =>
                normalizeSize(size)
              )
              .filter(Boolean)
          : [];

      /*
       * If the product has sizes configured,
       * a size MUST be supplied.
       */

      if (availableSizes.length > 0) {
        if (!selectedSize) {
          return res.status(400).json({
            success: false,
            message: `Please select a size for ${product.name}`,
          });
        }

        if (
          !availableSizes.includes(
            selectedSize
          )
        ) {
          return res.status(400).json({
            success: false,
            message: `Size ${selectedSize} is not available for ${product.name}`,
          });
        }
      }

      /*
       * ======================================================
       * COLOR
       * ======================================================
       */

      const selectedColor =
        String(item.color || "").trim();

      const availableColors =
        Array.isArray(product.colors)
          ? product.colors
              .map((color) =>
                String(color || "").trim()
              )
              .filter(Boolean)
          : [];

      let finalColor =
        selectedColor;

      /*
       * If colors exist on the product,
       * a color MUST be supplied.
       */

      if (
        availableColors.length > 0
      ) {
        if (!selectedColor) {
          return res.status(400).json({
            success: false,
            message: `Please select a color for ${product.name}`,
          });
        }

        /*
         * Compare case-insensitively.
         *
         * Example:
         *
         * "black"
         *
         * matches:
         *
         * "Black"
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
            message: `Color ${selectedColor} is not available for ${product.name}`,
          });
        }

        /*
         * Save the canonical value from
         * the Product document.
         */

        finalColor =
          matchingColor;
      }

      /*
       * ======================================================
       * PRICE
       * ======================================================
       *
       * Use MongoDB price, NOT item.price from frontend.
       */

      const price =
        Number(product.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      /*
       * ======================================================
       * CREATE ORDER LINE
       * ======================================================
       */

      orderItems.push({
        product: product._id,

        quantity,

        price,

        size: selectedSize,

        color: finalColor,
      });
    }

    /*
     * ========================================================
     * PRODUCT SUBTOTAL
     * ========================================================
     */

    const subtotal =
      orderItems.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      );

  

      /*
      * ============================================================
      * DELIVERY LOCATION
      * ============================================================
      */

      const requestedLocation =
        String(
          deliveryDetails?.location || ""
        ).trim();

      if (!requestedLocation) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery location is required",
        });
      }

      /*
      * Look up the location using the SERVER'S
      * delivery configuration.
      */

      const selectedDeliveryLocation =
        getDeliveryLocation(
          requestedLocation
        );

      if (!selectedDeliveryLocation) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery location",
        });
      }

      /*
      * IMPORTANT:
      *
      * This value comes from the server.
      *
      * We completely ignore:
      *
      * req.body.deliveryDetails.deliveryFee
      */

      const deliveryFee = selectedDeliveryLocation.fee;

    if (
      !Number.isFinite(
        deliveryFee
      ) ||
      deliveryFee < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery fee",
      });
    }

    /*
     * ========================================================
     * TOTAL
     * ========================================================
     *
     * IMPORTANT:
     *
     * We no longer trust:
     *
     * req.body.totalAmount
     *
     * Product prices are calculated from MongoDB.
     */

    const totalAmount =
      subtotal + deliveryFee;

    /*
     * ========================================================
     * CREATE ORDER
     * ========================================================
     */

    const order =
      await MpesaOrder.create({
        user: req.user._id,

        items: orderItems,

        totalAmount,

        deliveryDetails: {
          location:
            deliveryDetails?.location ||
            "",

          deliveryFee,

          phoneNumber:
            deliveryDetails
              ?.phoneNumber || "",
        },

        paymentMethod: "MPESA",

        paymentStatus: "PENDING",

        isPaid: false,
      });

    /*
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order,
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
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
        paymentStatus: "PAID",
      })
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product",
          "name price images category sizes colors"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
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
     * Validate ID before asking Mongoose
     * to cast it.
     */

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
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
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
     * ========================================================
     * SECURITY
     * ========================================================
     *
     * Customer:
     *   can only view own order.
     *
     * Admin:
     *   can view any order.
     */

    const orderUserId =
      order.user?._id
        ? String(order.user._id)
        : String(order.user);

    const currentUserId =
      String(req.user._id);

    if (
      req.user.role !== "admin" &&
      orderUserId !==
        currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
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
    const orders =
      await MpesaOrder.find({
        user: req.user._id,
      })
        .populate(
          "items.product",
          "name price images category sizes colors"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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