import mongoose from "mongoose";
import Product from "../models/product.model.js";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const normalizeSize = (size) =>
  String(size || "").trim();

const normalizeColor = (color) =>
  String(color || "")
    .trim()
    .toLowerCase();

/*
 * ============================================================
 * GET PRODUCT ID FROM CART ITEM
 * ============================================================
 *
 * cartItem.product may be:
 *
 * ObjectId
 *
 * OR
 *
 * populated Product document.
 */

const getCartProductId = (item) => {
  if (!item?.product) {
    return "";
  }

  if (item.product?._id) {
    return String(
      item.product._id
    );
  }

  return String(
    item.product
  );
};

/*
 * ============================================================
 * CHECK SAME VARIANT
 * ============================================================
 *
 * Cart line identity:
 *
 * product + size + color
 */

const isSameVariant = (
  item,
  productId,
  size,
  color
) => {
  return (
    getCartProductId(item) ===
      String(productId) &&
    normalizeSize(item.size) ===
      normalizeSize(size) &&
    normalizeColor(item.color) ===
      normalizeColor(color)
  );
};

/*
 * ============================================================
 * GET CART PRODUCTS
 * ============================================================
 *
 * GET /api/cart
 * ============================================================
 */

export const getCartProducts = async (
  req,
  res
) => {
  try {
    const user =
      req.user;

    /*
     * No cart.
     */

    if (
      !user.cartItems ||
      user.cartItems.length === 0
    ) {
      return res.json([]);
    }

    /*
     * Get unique product IDs.
     */

    const productIds =
      user.cartItems
        .map((item) =>
          getCartProductId(item)
        )
        .filter(
          (id) =>
            id &&
            mongoose.Types.ObjectId.isValid(
              id
            )
        );

    /*
     * Fetch products.
     */

    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },
      });

    /*
     * Fast lookup by product ID.
     */

    const productMap =
      new Map(
        products.map((product) => [
          String(product._id),
          product,
        ])
      );

    /*
     * IMPORTANT:
     *
     * Map CART ITEMS instead of PRODUCTS.
     *
     * This means the same product can appear
     * multiple times with different variants:
     *
     * Shirt / M / Black
     * Shirt / XL / White
     */

    const cartItems =
      user.cartItems
        .map((cartItem) => {
          const productId =
            getCartProductId(
              cartItem
            );

          const product =
            productMap.get(
              productId
            );

          /*
           * Product may have been deleted.
           */

          if (!product) {
            return null;
          }

          return {
            ...product.toJSON(),

            quantity:
              Number(
                cartItem.quantity ||
                  1
              ),

            size:
              cartItem.size ||
              null,

            color:
              cartItem.color ||
              null,

            /*
             * Useful later if we want to operate
             * directly on the cart subdocument.
             */

            cartItemId:
              cartItem._id,
          };
        })
        .filter(Boolean);

    return res.status(200).json(
      cartItems
    );
  } catch (error) {
    console.error(
      "GET CART PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/*
 * ============================================================
 * ADD TO CART
 * ============================================================
 *
 * POST /api/cart
 *
 * body:
 *
 * {
 *   productId,
 *   size,
 *   color
 * }
 * ============================================================
 */

export const addToCart = async (
  req,
  res
) => {
  try {
    const {
      productId,
      size = "",
      color = "",
    } = req.body;

    const user =
      req.user;

    /*
     * Validate product ID.
     */

    if (!productId) {
      return res.status(400).json({
        message:
          "Product ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid product ID",
      });
    }

    /*
     * Make sure product exists.
     */

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    /*
     * Normalize selections.
     */

    const selectedSize =
      normalizeSize(size);

    const selectedColor =
      String(color || "").trim();

    /*
     * ========================================================
     * VALIDATE SIZE
     * ========================================================
     *
     * If the product has configured sizes,
     * make sure the customer selected one of them.
     */

    const availableSizes =
      Array.isArray(product.sizes)
        ? product.sizes.map(
            (value) =>
              normalizeSize(value)
          )
        : [];

    if (
      availableSizes.length > 0
    ) {
      if (!selectedSize) {
        return res.status(400).json({
          message:
            "Please select a size",
        });
      }

      if (
        !availableSizes.includes(
          selectedSize
        )
      ) {
        return res.status(400).json({
          message:
            "Selected size is not available",
        });
      }
    }

    /*
     * ========================================================
     * VALIDATE COLOR
     * ========================================================
     */

    const availableColors =
      Array.isArray(product.colors)
        ? product.colors
        : [];

    if (
      availableColors.length > 0
    ) {
      if (!selectedColor) {
        return res.status(400).json({
          message:
            "Please select a color",
        });
      }

      const validColor =
        availableColors.find(
          (availableColor) =>
            normalizeColor(
              availableColor
            ) ===
            normalizeColor(
              selectedColor
            )
        );

      if (!validColor) {
        return res.status(400).json({
          message:
            "Selected color is not available",
        });
      }
    }

    /*
     * ========================================================
     * CHECK EXISTING VARIANT
     * ========================================================
     */

    const existingItem =
      user.cartItems.find(
        (item) =>
          isSameVariant(
            item,
            productId,
            selectedSize,
            selectedColor
          )
      );

    if (existingItem) {
      /*
       * Same product + same size + same color.
       *
       * Increase quantity.
       */

      existingItem.quantity += 1;
    } else {
      /*
       * Different variant.
       *
       * Create new cart line.
       */

      user.cartItems.push({
        product:
          product._id,

        quantity: 1,

        size:
          selectedSize,

        color:
          selectedColor,
      });
    }

    await user.save();

    return res.status(200).json(
      user.cartItems
    );
  } catch (error) {
    console.error(
      "ADD TO CART ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/*
 * ============================================================
 * REMOVE CART ITEM / CLEAR CART
 * ============================================================
 *
 * DELETE /api/cart
 *
 * Remove variant:
 *
 * {
 *   productId,
 *   size,
 *   color
 * }
 *
 * Clear entire cart:
 *
 * {}
 * ============================================================
 */

export const removeAllFromCart =
  async (req, res) => {
    try {
      const {
        productId,
        size = "",
        color = "",
      } = req.body || {};

      const user =
        req.user;

      /*
       * No product ID:
       *
       * Clear entire cart.
       */

      if (!productId) {
        user.cartItems = [];

        await user.save();

        return res
          .status(200)
          .json(
            user.cartItems
          );
      }

      /*
       * Remove only the exact
       * size/color variant.
       */

      user.cartItems =
        user.cartItems.filter(
          (item) =>
            !isSameVariant(
              item,
              productId,
              size,
              color
            )
        );

      await user.save();

      return res.status(200).json(
        user.cartItems
      );
    } catch (error) {
      console.error(
        "REMOVE CART ITEM ERROR:",
        error
      );

      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

/*
 * ============================================================
 * UPDATE QUANTITY
 * ============================================================
 *
 * PUT /api/cart/:id
 *
 * :id = Product ID
 *
 * body:
 *
 * {
 *   quantity,
 *   size,
 *   color
 * }
 * ============================================================
 */

export const updateQuantity = async (
  req,
  res
) => {
  try {
    const {
      id: productId,
    } = req.params;

    const {
      quantity,
      size = "",
      color = "",
    } = req.body;

    const user =
      req.user;

    /*
     * Validate quantity.
     */

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a non-negative integer",
      });
    }

    /*
     * Find exact product variant.
     */

    const existingItem =
      user.cartItems.find(
        (item) =>
          isSameVariant(
            item,
            productId,
            size,
            color
          )
      );

    if (!existingItem) {
      return res.status(404).json({
        message:
          "Cart item not found",
      });
    }

    /*
     * Quantity 0 removes the variant.
     */

    if (
      parsedQuantity === 0
    ) {
      user.cartItems =
        user.cartItems.filter(
          (item) =>
            !isSameVariant(
              item,
              productId,
              size,
              color
            )
        );

      await user.save();

      return res.status(200).json(
        user.cartItems
      );
    }

    /*
     * Update only this variant.
     */

    existingItem.quantity =
      parsedQuantity;

    await user.save();

    return res.status(200).json(
      user.cartItems
    );
  } catch (error) {
    console.error(
      "UPDATE CART QUANTITY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};