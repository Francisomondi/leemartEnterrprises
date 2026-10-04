import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

/*
 * ============================================================
 * NORMALIZE VARIANT VALUES
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
 * SAME CART VARIANT
 * ============================================================
 *
 * A cart line is identified by:
 *
 * product ID
 * +
 * selected size
 * +
 * selected color
 */

const isSameVariant = (
  item,
  productId,
  size,
  color
) => {
  return (
    String(item._id) ===
      String(productId) &&
    normalizeSize(item.size) ===
      normalizeSize(size) &&
    normalizeColor(item.color) ===
      normalizeColor(color)
  );
};

/*
 * ============================================================
 * CART STORE
 * ============================================================
 */

export const useCartStore = create(
  (set, get) => ({
    cart: [],

    coupon: null,

    total: 0,

    subtotal: 0,

    isCouponApplied: false,

    /*
     * ========================================================
     * GET COUPON
     * ========================================================
     */

    getMyCoupon: async () => {
      try {
        const response =
          await axios.get(
            "/coupons"
          );

        set({
          coupon:
            response.data,
        });
      } catch (error) {
        console.error(
          "Error fetching coupon:",
          error
        );
      }
    },

    /*
     * ========================================================
     * APPLY COUPON
     * ========================================================
     */

    applyCoupon: async (
      code
    ) => {
      try {
        const response =
          await axios.post(
            "/coupons/validate",
            { code }
          );

        set({
          coupon:
            response.data,

          isCouponApplied:
            true,
        });

        get().calculateTotals();

        toast.success(
          "Coupon applied successfully"
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to apply coupon"
        );
      }
    },

    /*
     * ========================================================
     * REMOVE COUPON
     * ========================================================
     */

    removeCoupon: () => {
      set({
        coupon: null,

        isCouponApplied:
          false,
      });

      get().calculateTotals();

      toast.success(
        "Coupon removed"
      );
    },

    /*
     * ========================================================
     * GET CART
     * ========================================================
     */

    getCartItems: async () => {
      try {
        const response =
          await axios.get(
            "/cart"
          );

        const cart =
          Array.isArray(
            response.data
          )
            ? response.data
            : response.data
                ?.cart || [];

        set({
          cart,
        });

        get().calculateTotals();
      } catch (error) {
        console.error(
          "GET CART ERROR:",
          error.response?.data ||
            error.message
        );

        set({
          cart: [],
        });

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load cart"
        );
      }
    },

    /*
     * ========================================================
     * ADD TO CART
     * ========================================================
     */

    addToCart: async (
      product
    ) => {
      try {
        const size =
          product.size || null;

        const color =
          product.color || null;

        /*
         * Send the customer's selected
         * variant to the backend.
         */

        const response =
          await axios.post(
            "/cart",
            {
              productId:
                product._id,

              size,

              color,
            }
          );

        /*
         * Update UI immediately.
         */

        set((state) => {
          const existingItem =
            state.cart.find(
              (item) =>
                isSameVariant(
                  item,
                  product._id,
                  size,
                  color
                )
            );

          let newCart;

          if (existingItem) {
            newCart =
              state.cart.map(
                (item) =>
                  isSameVariant(
                    item,
                    product._id,
                    size,
                    color
                  )
                    ? {
                        ...item,

                        quantity:
                          Number(
                            item.quantity ||
                              1
                          ) + 1,
                      }
                    : item
              );
          } else {
            newCart = [
              ...state.cart,

              {
                ...product,

                size,

                color,

                quantity: 1,
              },
            ];
          }

          return {
            cart: newCart,
          };
        });

        get().calculateTotals();

        toast.success(
          "Product added to cart"
        );

        return response.data;
      } catch (error) {
        console.error(
          "ADD TO CART ERROR:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to add product to cart"
        );

        throw error;
      }
    },

    /*
     * ========================================================
     * REMOVE FROM CART
     * ========================================================
     */

    removeFromCart: async (
      productId,
      size = null,
      color = null
    ) => {
      try {
        /*
         * DELETE can send a body through
         * Axios using `data`.
         */

        await axios.delete(
          "/cart",
          {
            data: {
              productId,
              size,
              color,
            },
          }
        );

        set((state) => ({
          cart:
            state.cart.filter(
              (item) =>
                !isSameVariant(
                  item,
                  productId,
                  size,
                  color
                )
            ),
        }));

        get().calculateTotals();

        toast.success(
          "Product removed from cart"
        );
      } catch (error) {
        console.error(
          "REMOVE CART ITEM ERROR:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to remove product"
        );

        throw error;
      }
    },

    /*
     * ========================================================
     * UPDATE QUANTITY
     * ========================================================
     */

    updateQuantity: async (
      productId,
      quantity,
      size = null,
      color = null
    ) => {
      try {
        if (quantity <= 0) {
          await get().removeFromCart(
            productId,
            size,
            color
          );

          return;
        }

        await axios.put(
          `/cart/${productId}`,
          {
            quantity,
            size,
            color,
          }
        );

        set((state) => ({
          cart:
            state.cart.map(
              (item) =>
                isSameVariant(
                  item,
                  productId,
                  size,
                  color
                )
                  ? {
                      ...item,
                      quantity,
                    }
                  : item
            ),
        }));

        get().calculateTotals();
      } catch (error) {
        console.error(
          "UPDATE CART QUANTITY ERROR:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update quantity"
        );

        throw error;
      }
    },

    /*
     * ========================================================
     * CLEAR CART
     * ========================================================
     */

	clearCart: async () => {
	try {
		await axios.delete("/cart");

		set({
		cart: [],
		subtotal: 0,
		total: 0,
		});

		get().calculateTotals();
	} catch (error) {
		console.error(
		"CLEAR CART ERROR:",
		error.response?.data ||
			error.message
		);

		toast.error(
		error.response?.data?.message ||
			"Failed to clear cart"
		);

		throw error;
	}
	},

    /*
     * ========================================================
     * CALCULATE TOTALS
     * ========================================================
     */

    calculateTotals: () => {
      const {
        cart,
        coupon,
      } = get();

      const subtotal =
        cart.reduce(
          (sum, item) => {
            const price =
              Number(
                item.price || 0
              );

            const quantity =
              Number(
                item.quantity || 0
              );

            return (
              sum +
              price * quantity
            );
          },
          0
        );

      let total =
        subtotal;

      if (coupon) {
        const percentage =
          Number(
            coupon.discountPercentage ||
              0
          );

        const discount =
          subtotal *
          (percentage / 100);

        total =
          subtotal -
          discount;
      }

      set({
        subtotal,
        total,
      });
    },
  })
);