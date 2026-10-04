import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

/*
 * ============================================================
 * CATEGORY HELPERS
 * ============================================================
 */

const SIZE_OPTIONAL_CATEGORIES = [
  "bags",
  "hats",
];

/*
 * ============================================================
 * NORMALIZE CATEGORY
 * ============================================================
 */

const normalizeCategory = (category) =>
  String(category || "")
    .trim()
    .toLowerCase();

/*
 * ============================================================
 * PRODUCT PAGE
 * ============================================================
 */

const ProductPage = () => {
  const { id } = useParams();

  const { user } = useUserStore();

  const {
    fetchProductById,
    selectedProduct,
    products,
    isLoading,
  } = useProductStore();

  /*
   * ==========================================================
   * CART
   * ==========================================================
   */

  const cartItems = useCartStore(
    (state) =>
      state.cart ||
      state.cartItems ||
      []
  );

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  /*
   * ==========================================================
   * LOCAL STATE
   * ==========================================================
   */

  const [
    selectedSize,
    setSelectedSize,
  ] = useState("");

  const [
    selectedColor,
    setSelectedColor,
  ] = useState("");

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);

  /*
   * ==========================================================
   * FETCH PRODUCT
   * ==========================================================
   */

  useEffect(() => {
    if (!id) return;

    fetchProductById(id);

    setSelectedSize("");
    setSelectedColor("");
    setActiveImage(0);
  }, [id, fetchProductById]);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    isLoading ||
    !selectedProduct ||
    selectedProduct._id !== id
  ) {
    return (
      <div
        className="
          min-h-[70vh]
          flex
          items-center
          justify-center
          px-4
        "
      >
        <p className="text-gray-300">
          Loading product...
        </p>
      </div>
    );
  }

  /*
   * ==========================================================
   * CATEGORY
   * ==========================================================
   */

  const category =
    normalizeCategory(
      selectedProduct.category
    );

  const sizeIsOptional =
    SIZE_OPTIONAL_CATEGORIES.includes(
      category
    );

  /*
   * ==========================================================
   * ACTUAL PRODUCT SIZES
   * ==========================================================
   *
   * Do NOT generate sizes here.
   *
   * Admin controls which sizes are available.
   */

  const sizeOptions =
    Array.isArray(
      selectedProduct.sizes
    )
      ? selectedProduct.sizes.map(
          (size) => String(size)
        )
      : [];

  /*
   * ==========================================================
   * ACTUAL PRODUCT COLORS
   * ==========================================================
   */

  const colorOptions =
    Array.isArray(
      selectedProduct.colors
    )
      ? selectedProduct.colors
      : [];

  /*
   * ==========================================================
   * IMAGES
   * ==========================================================
   */

  const images =
    selectedProduct.images?.length
      ? selectedProduct.images
      : selectedProduct.image
      ? [selectedProduct.image]
      : [];

  const mainImage =
    images[activeImage] ||
    images[0] ||
    "";

  /*
   * ==========================================================
   * STOCK
   * ==========================================================
   */

  const inStock =
    selectedProduct.stock ===
      undefined ||
    selectedProduct.stock > 0;

  /*
   * ==========================================================
   * VARIANT REQUIREMENTS
   * ==========================================================
   */

  const requiresSize =
    !sizeIsOptional &&
    sizeOptions.length > 0;

  const requiresColor =
    colorOptions.length > 0;

  /*
   * ==========================================================
   * CHECK CART
   * ==========================================================
   *
   * We check product + size + color.
   *
   * This allows:
   *
   * Shirt / M / Black
   * Shirt / L / White
   *
   * to exist as separate cart variants.
   */

  const isInCart =
    cartItems.some((item) => {
      const sameProduct =
        item._id ===
        selectedProduct._id;

      const sameSize =
        String(
          item.size || ""
        ) ===
        String(
          selectedSize || ""
        );

      const sameColor =
        String(
          item.color || ""
        ).toLowerCase() ===
        String(
          selectedColor || ""
        ).toLowerCase();

      return (
        sameProduct &&
        sameSize &&
        sameColor
      );
    });

  /*
   * ==========================================================
   * ADD TO CART
   * ==========================================================
   */

  const handleAddToCart = () => {
    if (!user) {
      toast.error(
        "Please login to add products to cart"
      );

      return;
    }

    if (!inStock) {
      toast.error(
        "This product is currently out of stock"
      );

      return;
    }

    /*
     * Require size only when appropriate.
     */

    if (
      requiresSize &&
      !selectedSize
    ) {
      toast.error(
        "Please select a size"
      );

      return;
    }

    /*
     * Require color when product
     * has available colors.
     */

    if (
      requiresColor &&
      !selectedColor
    ) {
      toast.error(
        "Please select a color"
      );

      return;
    }

    if (isInCart) {
      toast(
        "This option is already in your cart"
      );

      return;
    }

    /*
     * Add selected variant.
     */

    addToCart({
      ...selectedProduct,

      size:
        selectedSize || null,

      color:
        selectedColor || null,
    });

    toast.success(
      "Added to cart 🛒"
    );
  };

  /*
   * ==========================================================
   * IMAGE NAVIGATION
   * ==========================================================
   */

  const showPreviousImage = () => {
    if (images.length <= 1) return;

    setActiveImage(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );
  };

  const showNextImage = () => {
    if (images.length <= 1) return;

    setActiveImage(
      (current) =>
        current ===
        images.length - 1
          ? 0
          : current + 1
    );
  };

  /*
   * ==========================================================
   * RELATED PRODUCTS
   * ==========================================================
   */

  const relatedProducts =
    products
      .filter((product) => {
        const sameCategory =
          normalizeCategory(
            product.category
          ) === category;

        const differentProduct =
          product._id !==
          selectedProduct._id;

        return (
          sameCategory &&
          differentProduct
        );
      })
      .slice(0, 4);

  /*
   * ==========================================================
   * PRICE
   * ==========================================================
   */

  const formattedPrice =
    Number(
      selectedProduct.price || 0
    ).toLocaleString("en-KE");

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <>
      <Helmet>
        <title>
          {selectedProduct.name} |
          Leemart
        </title>

        <meta
          name="description"
          content={
            selectedProduct.description ||
            selectedProduct.name
          }
        />
      </Helmet>

      <main
        className="
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          pt-24
          pb-16
          text-white
        "
      >
        {/* =========================================
            PRODUCT
        ========================================= */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
            lg:gap-12
          "
        >
          {/* =====================================
              IMAGES
          ===================================== */}

          <section>
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                bg-gray-800
                border
                border-gray-700
              "
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={
                    selectedProduct.name
                  }
                  className="
                    w-full
                    aspect-square
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    w-full
                    aspect-square
                    flex
                    items-center
                    justify-center
                    text-gray-500
                  "
                >
                  No image available
                </div>
              )}

              {/* IMAGE ARROWS */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={
                      showPreviousImage
                    }
                    aria-label="Previous image"
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-10
                      h-10
                      rounded-full
                      bg-black/60
                      hover:bg-black/80
                      flex
                      items-center
                      justify-center
                      transition
                    "
                  >
                    <ChevronLeft
                      size={20}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      showNextImage
                    }
                    aria-label="Next image"
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      w-10
                      h-10
                      rounded-full
                      bg-black/60
                      hover:bg-black/80
                      flex
                      items-center
                      justify-center
                      transition
                    "
                  >
                    <ChevronRight
                      size={20}
                    />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}

            {images.length > 1 && (
              <div
                className="
                  mt-4
                  flex
                  gap-3
                  overflow-x-auto
                  pb-2
                "
              >
                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                      className={`
                        shrink-0
                        rounded-xl
                        overflow-hidden
                        border-2
                        transition

                        ${
                          activeImage ===
                          index
                            ? "border-emerald-500"
                            : "border-gray-700"
                        }
                      `}
                    >
                      <img
                        src={image}
                        alt={`${selectedProduct.name} ${
                          index + 1
                        }`}
                        className="
                          h-20
                          w-20
                          object-cover
                        "
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          {/* =====================================
              PRODUCT DETAILS
          ===================================== */}

          <section>
            {/* CATEGORY */}

            <p
              className="
                text-sm
                uppercase
                tracking-wider
                text-emerald-400
                font-medium
              "
            >
              {selectedProduct.category}
            </p>

            {/* NAME */}

            <h1
              className="
                mt-2
                text-3xl
                sm:text-4xl
                font-bold
                text-white
              "
            >
              {selectedProduct.name}
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-4
                text-gray-300
                leading-7
              "
            >
              {
                selectedProduct.description
              }
            </p>

            {/* PRICE */}

            <p
              className="
                mt-6
                text-3xl
                font-bold
                text-emerald-400
              "
            >
              KES {formattedPrice}
            </p>

            {/* STOCK */}

            <div className="mt-3">
              {inStock ? (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    text-emerald-400
                  "
                >
                  <Check size={16} />

                  In Stock
                </span>
              ) : (
                <span
                  className="
                    text-sm
                    text-red-400
                  "
                >
                  Out of Stock
                </span>
              )}
            </div>

            {/* =================================
                SIZES
            ================================= */}

            {sizeOptions.length >
              0 && (
              <div className="mt-8">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-3
                  "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-300
                    "
                  >
                    Select Size
                  </p>

                  {selectedSize && (
                    <span
                      className="
                        text-xs
                        text-emerald-400
                      "
                    >
                      Selected:{" "}
                      {selectedSize}
                    </span>
                  )}
                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {sizeOptions.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(
                            size
                          )
                        }
                        className={`
                          min-w-[48px]
                          min-h-[44px]
                          px-3
                          rounded-lg
                          border
                          text-sm
                          font-semibold
                          transition

                          ${
                            selectedSize ===
                            size
                              ? `
                                  bg-emerald-600
                                  border-emerald-500
                                  text-white
                                `
                              : `
                                  bg-gray-800
                                  border-gray-700
                                  text-gray-300
                                  hover:border-emerald-500
                                `
                          }
                        `}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =================================
                COLORS
            ================================= */}

            {colorOptions.length >
              0 && (
              <div className="mt-8">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-3
                  "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-300
                    "
                  >
                    Select Color
                  </p>

                  {selectedColor && (
                    <span
                      className="
                        text-xs
                        text-emerald-400
                      "
                    >
                      Selected:{" "}
                      {selectedColor}
                    </span>
                  )}
                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {colorOptions.map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setSelectedColor(
                            color
                          )
                        }
                        className={`
                          min-h-[44px]
                          px-4
                          rounded-full
                          border
                          text-sm
                          font-medium
                          transition

                          ${
                            selectedColor ===
                            color
                              ? `
                                  bg-emerald-600
                                  border-emerald-500
                                  text-white
                                `
                              : `
                                  bg-gray-800
                                  border-gray-700
                                  text-gray-300
                                  hover:border-emerald-500
                                `
                          }
                        `}
                      >
                        {color}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =================================
                SELECTED VARIANT SUMMARY
            ================================= */}

            {(selectedSize ||
              selectedColor) && (
              <div
                className="
                  mt-7
                  p-4
                  rounded-xl
                  bg-gray-800
                  border
                  border-gray-700
                "
              >
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-gray-500
                    mb-2
                  "
                >
                  Your selection
                </p>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-x-6
                    gap-y-2
                    text-sm
                  "
                >
                  {selectedSize && (
                    <p>
                      <span className="text-gray-400">
                        Size:
                      </span>{" "}
                      <span className="font-semibold">
                        {
                          selectedSize
                        }
                      </span>
                    </p>
                  )}

                  {selectedColor && (
                    <p>
                      <span className="text-gray-400">
                        Color:
                      </span>{" "}
                      <span className="font-semibold">
                        {
                          selectedColor
                        }
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* =================================
                ADD TO CART
            ================================= */}

            <div className="mt-8">
              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  isInCart ||
                  !inStock
                }
                className={`
                  flex
                  w-full
                  min-h-[52px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-5
                  py-3
                  text-base
                  font-semibold
                  text-white
                  transition

                  ${
                    isInCart ||
                    !inStock
                      ? `
                          cursor-not-allowed
                          bg-gray-600
                        `
                      : `
                          bg-emerald-600
                          hover:bg-emerald-700
                          active:scale-[0.99]
                        `
                  }
                `}
              >
                <ShoppingCart
                  size={20}
                />

                {isInCart
                  ? "In Cart"
                  : !inStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>
          </section>
        </div>

        {/* =====================================
            RELATED PRODUCTS
        ===================================== */}

        {relatedProducts.length >
          0 && (
          <section className="mt-20">
            <h2
              className="
                mb-6
                text-2xl
                font-bold
              "
            >
              Related Products
            </h2>

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                gap-4
                sm:gap-6
              "
            >
              {relatedProducts.map(
                (product) => {
                  const image =
                    product.images?.[0] ||
                    product.image;

                  return (
                    <Link
                      key={
                        product._id
                      }
                      to={`/product/${product._id}`}
                      className="
                        group
                        rounded-xl
                        overflow-hidden
                        border
                        border-gray-700
                        bg-gray-800
                        hover:border-emerald-500
                        transition
                      "
                    >
                      <div
                        className="
                          aspect-square
                          overflow-hidden
                          bg-gray-700
                        "
                      >
                        {image && (
                          <img
                            src={image}
                            alt={
                              product.name
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                              group-hover:scale-105
                              transition
                              duration-300
                            "
                          />
                        )}
                      </div>

                      <div className="p-3 sm:p-4">
                        <p
                          className="
                            font-semibold
                            text-sm
                            sm:text-base
                            line-clamp-2
                          "
                        >
                          {product.name}
                        </p>

                        <p
                          className="
                            mt-2
                            text-emerald-400
                            font-semibold
                          "
                        >
                          KES{" "}
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString(
                            "en-KE"
                          )}
                        </p>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default ProductPage;