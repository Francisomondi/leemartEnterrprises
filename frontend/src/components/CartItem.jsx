import {
  Minus,
  Plus,
  Trash,
  ImageIcon,
  Ruler,
  Palette,
} from "lucide-react";

import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
  const {
    removeFromCart,
    updateQuantity,
  } = useCartStore();

  /*
   * ============================================================
   * PRODUCT IMAGE
   * ============================================================
   */

  const images =
    Array.isArray(item.images)
      ? item.images
      : [];

  const mainImage =
    images[0] ||
    item.image ||
    null;

  /*
   * ============================================================
   * SELECTED VARIANT
   * ============================================================
   */

  const selectedSize =
    item.size || null;

  const selectedColor =
    item.color || null;

  /*
   * ============================================================
   * QUANTITY
   * ============================================================
   */

  const decreaseQty = () => {
    if (item.quantity <= 1) {
      return;
    }

    updateQuantity(
      item._id,
      item.quantity - 1,
      selectedSize,
      selectedColor
    );
  };

  const increaseQty = () => {
    updateQuantity(
      item._id,
      item.quantity + 1,
      selectedSize,
      selectedColor
    );
  };

  /*
   * ============================================================
   * REMOVE
   * ============================================================
   */

  const handleRemove = () => {
    removeFromCart(
      item._id,
      selectedSize,
      selectedColor
    );
  };

  /*
   * ============================================================
   * PRICE
   * ============================================================
   */

  const itemTotal =
    Number(item.price || 0) *
    Number(item.quantity || 1);

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-700
        bg-gray-800
        p-4
        shadow-sm
        md:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:gap-6
        "
      >
        {/* ==================================================
            IMAGE
        ================================================== */}

        <div className="shrink-0">
          {mainImage ? (
            <img
              src={mainImage}
              alt={item.name}
              className="
                h-24
                w-24
                rounded-xl
                object-cover
                md:h-32
                md:w-32
              "
            />
          ) : (
            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-xl
                bg-gray-700
                md:h-32
                md:w-32
              "
            >
              <ImageIcon
                className="text-gray-400"
              />
            </div>
          )}
        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="min-w-0 flex-1">
          <p
            className="
              text-base
              font-semibold
              text-white
            "
          >
            {item.name}
          </p>

          {item.description && (
            <p
              className="
                mt-1
                line-clamp-2
                text-sm
                text-gray-400
              "
            >
              {item.description}
            </p>
          )}

          {/* ================================================
              CUSTOMER'S SELECTED SIZE + COLOR
          ================================================ */}

          {(selectedSize ||
            selectedColor) && (
            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-2
              "
            >
              {/* SIZE */}

              {selectedSize && (
                <div
                  className="
                    inline-flex
                    min-h-[36px]
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-gray-600
                    bg-gray-900/60
                    px-3
                    py-1.5
                  "
                >
                  <Ruler
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-xs text-gray-400">
                    Size
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {selectedSize}
                  </span>
                </div>
              )}

              {/* COLOR */}

              {selectedColor && (
                <div
                  className="
                    inline-flex
                    min-h-[36px]
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-gray-600
                    bg-gray-900/60
                    px-3
                    py-1.5
                  "
                >
                  <Palette
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-xs text-gray-400">
                    Color
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {selectedColor}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* REMOVE */}

          <button
            type="button"
            onClick={handleRemove}
            className="
              mt-4
              inline-flex
              min-h-[36px]
              items-center
              gap-1.5
              text-sm
              font-medium
              text-red-400
              transition
              hover:text-red-300
            "
          >
            <Trash size={16} />

            Remove
          </button>
        </div>

        {/* ==================================================
            QUANTITY + PRICE
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            border-t
            border-gray-700
            pt-4
            md:flex-col
            md:items-end
            md:border-0
            md:pt-0
          "
        >
          {/* QUANTITY */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={decreaseQty}
              disabled={
                item.quantity <= 1
              }
              aria-label="Decrease quantity"
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                transition

                ${
                  item.quantity <= 1
                    ? `
                        cursor-not-allowed
                        border-gray-700
                        bg-gray-700
                        opacity-50
                      `
                    : `
                        border-gray-600
                        bg-gray-700
                        hover:border-emerald-500
                        hover:bg-gray-600
                      `
                }
              `}
            >
              <Minus
                className="
                  h-4
                  w-4
                  text-gray-300
                "
              />
            </button>

            <span
              className="
                min-w-[32px]
                text-center
                font-semibold
                text-white
              "
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={increaseQty}
              aria-label="Increase quantity"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-gray-600
                bg-gray-700
                transition
                hover:border-emerald-500
                hover:bg-gray-600
              "
            >
              <Plus
                className="
                  h-4
                  w-4
                  text-gray-300
                "
              />
            </button>
          </div>

          {/* PRICE */}

          <div className="text-right">
            <p
              className="
                text-xs
                text-gray-500
              "
            >
              {item.quantity} × KES{" "}
              {Number(
                item.price || 0
              ).toLocaleString(
                "en-KE"
              )}
            </p>

            <p
              className="
                mt-1
                text-base
                font-bold
                text-emerald-400
              "
            >
              KES{" "}
              {itemTotal.toLocaleString(
                "en-KE"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;