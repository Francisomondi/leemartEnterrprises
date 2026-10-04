import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  products: [],
  selectedProduct: null,
  loading: false,
  isLoading: false,
  error: null,

  /*
   * ============================================================
   * SET PRODUCTS
   * ============================================================
   */

  setProducts: (products) =>
    set({
      products: Array.isArray(products)
        ? products
        : [],
    }),

  /*
   * ============================================================
   * CREATE PRODUCT
   * ============================================================
   */

  createProduct: async (formData) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await axios.post(
        "/products",
        formData,
        {
          withCredentials: true,
        }
      );

      /*
       * Supports either:
       *
       * res.data
       *
       * OR
       *
       * {
       *   product: {...}
       * }
       */

      const newProduct =
        response.data?.product ||
        response.data;

      set((state) => ({
        products: [
          newProduct,
          ...state.products,
        ],
      }));

      toast.success(
        "Product created successfully"
      );

      return newProduct;
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error.response?.data ||
          error.message
      );

      set({
        error:
          error.response?.data
            ?.message ||
          "Failed to create product",
      });

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create product"
      );

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  /*
   * ============================================================
   * UPDATE PRODUCT
   * ============================================================
   */

  updateProduct: async (
    productId,
    formData
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      /*
       * IMPORTANT:
       *
       * Use `axios`, because that is what
       * was imported at the top of this file.
       *
       * formData is browser FormData containing:
       *
       * name
       * price
       * category
       * description
       * existingImages
       * images
       */

      const response = await axios.put(
        `/products/${productId}`,
        formData,
        {
          withCredentials: true,
        }
      );

      /*
       * Our new controller returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   product: updatedProduct
       * }
       *
       * Fallback also keeps this compatible
       * with the previous controller.
       */

      const updatedProduct =
        response.data?.product ||
        response.data;

      if (!updatedProduct?._id) {
        throw new Error(
          "Server did not return the updated product"
        );
      }

      /*
       * ========================================================
       * UPDATE PRODUCT IN ZUSTAND IMMEDIATELY
       * ========================================================
       */

      set((state) => ({
        products:
          state.products.map(
            (product) =>
              product._id ===
              productId
                ? updatedProduct
                : product
          ),

        selectedProduct:
          state.selectedProduct
            ?._id === productId
            ? updatedProduct
            : state.selectedProduct,
      }));

      toast.success(
        "Product updated successfully"
      );

      return updatedProduct;
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error.response?.data ||
          error.message
      );

      const message =
        error.response?.data
          ?.message ||
        error.response?.data
          ?.error ||
        error.message ||
        "Failed to update product";

      set({
        error: message,
      });

      toast.error(message);

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  /*
   * ============================================================
   * FETCH ALL PRODUCTS
   * ============================================================
   */

  fetchAllProducts: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response =
        await axios.get(
          "/products"
        );

      /*
       * Supports:
       *
       * { products: [...] }
       *
       * and
       *
       * [...]
       */

      const products =
        response.data?.products ||
        response.data ||
        [];

      set({
        products:
          Array.isArray(products)
            ? products
            : [],
      });

      return products;
    } catch (error) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        error.response?.data ||
          error.message
      );

      const message =
        error.response?.data
          ?.message ||
        error.response?.data
          ?.error ||
        "Failed to fetch products";

      set({
        error: message,
      });

      toast.error(message);

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  /*
   * ============================================================
   * FETCH PRODUCTS BY CATEGORY
   * ============================================================
   */

  fetchProductsByCategory:
    async (category) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const response =
          await axios.get(
            `/products/category/${encodeURIComponent(
              category
            )}`
          );

        const products =
          response.data?.products ||
          response.data ||
          [];

        set({
          products:
            Array.isArray(products)
              ? products
              : [],
        });

        return products;
      } catch (error) {
        console.error(
          "FETCH CATEGORY PRODUCTS ERROR:",
          error.response?.data ||
            error.message
        );

        const message =
          error.response?.data
            ?.message ||
          error.response?.data
            ?.error ||
          "Failed to fetch products";

        set({
          error: message,
        });

        toast.error(message);

        throw error;
      } finally {
        set({
          loading: false,
        });
      }
    },

  /*
   * ============================================================
   * FETCH SINGLE PRODUCT
   * ============================================================
   */

  fetchProductById: async (
    id
  ) => {
    try {
      set({
        isLoading: true,
        selectedProduct: null,
        error: null,
      });

      const response =
        await axios.get(
          `/products/${id}`
        );

      const product =
        response.data?.product ||
        response.data;

      set({
        selectedProduct:
          product,
      });

      return product;
    } catch (error) {
      console.error(
        "FETCH PRODUCT ERROR:",
        error.response?.data ||
          error.message
      );

      set({
        error:
          error.response?.data
            ?.message ||
          "Failed to fetch product",
      });

      throw error;
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  /*
   * ============================================================
   * DELETE PRODUCT
   * ============================================================
   */

  deleteProduct: async (
    productId
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await axios.delete(
        `/products/${productId}`,
        {
          withCredentials: true,
        }
      );

      set((state) => ({
        products:
          state.products.filter(
            (product) =>
              product._id !==
              productId
          ),

        selectedProduct:
          state.selectedProduct
            ?._id === productId
            ? null
            : state.selectedProduct,
      }));

      toast.success(
        "Product deleted successfully"
      );

      return true;
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error.response?.data ||
          error.message
      );

      const message =
        error.response?.data
          ?.message ||
        error.response?.data
          ?.error ||
        "Failed to delete product";

      set({
        error: message,
      });

      toast.error(message);

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  /*
   * ============================================================
   * TOGGLE FEATURED PRODUCT
   * ============================================================
   */

  toggleFeaturedProduct:
    async (productId) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const response =
          await axios.patch(
            `/products/${productId}`,
            {},
            {
              withCredentials: true,
            }
          );

        /*
         * Support both response shapes:
         *
         * { product: {...} }
         *
         * OR
         *
         * { isFeatured: true }
         */

        const returnedProduct =
          response.data?.product;

        set((state) => ({
          products:
            state.products.map(
              (product) => {
                if (
                  product._id !==
                  productId
                ) {
                  return product;
                }

                if (
                  returnedProduct
                    ?._id
                ) {
                  return returnedProduct;
                }

                return {
                  ...product,

                  isFeatured:
                    response.data
                      ?.isFeatured ??
                    !product.isFeatured,
                };
              }
            ),
        }));

        toast.success(
          "Featured status updated"
        );

        return (
          returnedProduct ||
          response.data
        );
      } catch (error) {
        console.error(
          "TOGGLE FEATURED ERROR:",
          error.response?.data ||
            error.message
        );

        const message =
          error.response?.data
            ?.message ||
          error.response?.data
            ?.error ||
          "Failed to update product";

        set({
          error: message,
        });

        toast.error(message);

        throw error;
      } finally {
        set({
          loading: false,
        });
      }
    },

  /*
   * ============================================================
   * FETCH FEATURED PRODUCTS
   * ============================================================
   */

  fetchFeaturedProducts:
    async () => {
      try {
        set({
          loading: true,
          error: null,
        });

        const response =
          await axios.get(
            "/products/featured"
          );

        const products =
          response.data?.products ||
          response.data ||
          [];

        set({
          products:
            Array.isArray(products)
              ? products
              : [],
        });

        return products;
      } catch (error) {
        console.error(
          "FETCH FEATURED PRODUCTS ERROR:",
          error.response?.data ||
            error.message
        );

        set({
          error:
            error.response?.data
              ?.message ||
            "Failed to fetch featured products",
        });

        throw error;
      } finally {
        set({
          loading: false,
        });
      }
    },
}));