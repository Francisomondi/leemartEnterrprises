import toast from "react-hot-toast";
import {
  ShoppingCart,
  ImageIcon,
  Settings2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const { user } = useUserStore();

  const cartItems = useCartStore(
    (state) => state.cart || state.cartItems || []
  );

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  /*
   * ============================================================
   * PRODUCT DATA
   * ============================================================
   */

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const mainImage = images[0];

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
        .map((size) => String(size).trim())
        .filter(Boolean)
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors
        .map((color) => String(color).trim())
        .filter(Boolean)
    : [];

  /*
   * Product requires customer selection if it has
   * either sizes or colors.
   */

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  const requiresOptions =
    hasSizes || hasColors;

  /*
   * Stock defaults to available if stock isn't
   * currently being tracked.
   */

  const inStock =
    product.stock === undefined ||
    product.stock === null ||
    Number(product.stock) > 0;

  /*
   * ============================================================
   * DIRECT-CART CHECK
   * ============================================================
   *
   * Only relevant for products without variants.
   *
   * Variant products are checked on ProductPage after the
   * customer chooses size/color.
   */

  const isInCart = !requiresOptions
    ? cartItems.some((item) => {
        return (
          String(item._id) === String(product._id) &&
          !item.size &&
          !item.color
        );
      })
    : false;

  /*
   * ============================================================
   * ACTION
   * ============================================================
   */

  const handleAction = async () => {
    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }

    /*
     * Products with size/color must first go to
     * ProductPage so the customer can choose them.
     */

    if (requiresOptions) {
      navigate(`/product/${product._id}`);
      return;
    }

    /*
     * Direct add-to-cart products.
     */

    if (!user) {
      toast.error(
        "Please login to add products to cart"
      );
      return;
    }

    if (isInCart) {
      toast("Already in cart");
      return;
    }

    try {
      /*
       * Explicitly send no variant.
       */

      await addToCart({
        ...product,
        size: null,
        color: null,
      });

      /*
       * Let the cart store/backend handle the actual
       * cart operation.
       *
       * If your addToCart store already shows a success
       * toast, remove this toast to avoid duplicates.
       */

      toast.success("Added to cart");
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );
    }
  };

  return (
    <article
      className="
        group
        relative
        flex
        w-full
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-gray-700
        bg-gray-800
        shadow-lg
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-emerald-500/20
      "
    >
      {/* ======================================================
          PRODUCT IMAGE
      ====================================================== */}

      <Link
        to={`/product/${product._id}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div
          className="
            relative
            m-2
            mb-0
            aspect-square
            overflow-hidden
            rounded-lg
            bg-gray-700
            sm:m-3
            sm:mb-0
          "
        >
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
              "
            >
              <ImageIcon
                className="
                  h-8
                  w-8
                  text-gray-400
                  sm:h-10
                  sm:w-10
                "
              />
            </div>
          )}

          {/* DARK OVERLAY */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/10
            "
          />

          {/* STOCK BADGE */}

          <span
            className={`
              absolute
              left-2
              top-2
              rounded-md
              px-2
              py-1
              text-[10px]
              font-semibold
              text-white
              sm:text-xs
              ${
                inStock
                  ? "bg-emerald-600"
                  : "bg-red-600"
              }
            `}
          >
            {inStock
              ? "In Stock"
              : "Out of Stock"}
          </span>

          {/* IMAGE COUNT */}

          {images.length > 1 && (
            <span
              className="
                absolute
                bottom-2
                right-2
                rounded-md
                bg-black/70
                px-2
                py-1
                text-[10px]
                text-white
                sm:text-xs
              "
            >
              +{images.length - 1}
            </span>
          )}
        </div>
      </Link>

      {/* ======================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-3
          sm:p-5
        "
      >
        {/* NAME */}

        <Link
          to={`/product/${product._id}`}
          className="
            transition
            hover:text-emerald-400
          "
        >
          <h3
            className="
              line-clamp-2
              text-sm
              font-semibold
              text-white
              sm:text-lg
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}

        <p
          className="
            mt-2
            text-lg
            font-bold
            text-emerald-400
            sm:text-2xl
          "
        >
          KES{" "}
          {Number(
            product.price || 0
          ).toLocaleString("en-KE")}
        </p>

        {/* ==================================================
            AVAILABLE OPTIONS
        ================================================== */}

        {requiresOptions && (
          <div
            className="
              mt-3
              space-y-2
              text-xs
              text-gray-400
              sm:text-sm
            "
          >
            {/* SIZES */}

            {hasSizes && (
              <div>
                <span className="font-medium text-gray-300">
                  Sizes:
                </span>{" "}
                <span>
                  {sizes
                    .slice(0, 5)
                    .join(", ")}
                  {sizes.length > 5
                    ? "..."
                    : ""}
                </span>
              </div>
            )}

            {/* COLORS */}

            {hasColors && (
              <div>
                <span className="font-medium text-gray-300">
                  Colors:
                </span>{" "}
                <span>
                  {colors
                    .slice(0, 3)
                    .join(", ")}
                  {colors.length > 3
                    ? "..."
                    : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Push button to bottom */}

        <div className="flex-1" />

        {/* ==================================================
            ACTION
        ================================================== */}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAction}
            disabled={
              !inStock ||
              (!requiresOptions &&
                isInCart)
            }
            className={`
              flex
              min-h-[42px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              px-3
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              sm:px-5
              sm:text-sm
              ${
                !inStock ||
                (!requiresOptions &&
                  isInCart)
                  ? `
                    cursor-not-allowed
                    bg-gray-600
                  `
                  : `
                    bg-emerald-600
                    hover:bg-emerald-700
                    active:scale-[0.98]
                  `
              }
            `}
          >
            {requiresOptions ? (
              <>
                <Settings2 size={17} />

                <span>
                  Select Options
                </span>
              </>
            ) : (
              <>
                <ShoppingCart
                  size={17}
                />

                <span>
                  {isInCart
                    ? "In Cart"
                    : "Add to Cart"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;