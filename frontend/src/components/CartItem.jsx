import { Minus, Plus, Trash, ImageIcon } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  const images = item.images || [];
  const mainImage = images[0];

  const decreaseQty = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const increaseQty = () => {
    updateQuantity(item._id, item.quantity + 1);
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">

        {/* IMAGE */}
        <div className="shrink-0">
          {mainImage ? (
            <img
              src={mainImage}
              alt={item.name}
              className="h-20 w-20 rounded object-cover md:h-32 md:w-32"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-700 md:h-32 md:w-32">
              <ImageIcon className="text-gray-400" />
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-1 space-y-2">
          <p className="text-base font-semibold text-white hover:text-emerald-400">
            {item.name}
          </p>
          {item.description && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {item.description}
            </p>
          )}

          <button
            onClick={() => removeFromCart(item._id)}
            className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300"
          >
            <Trash size={16} />
            Remove
          </button>
        </div>

        {/* QUANTITY + PRICE */}
        <div className="flex items-center justify-between gap-6 md:justify-end">

          {/* QUANTITY CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseQty}
              disabled={item.quantity === 1}
              className={`flex h-8 w-8 items-center justify-center rounded-md border 
                ${
                  item.quantity === 1
                    ? "cursor-not-allowed border-gray-700 bg-gray-700"
                    : "border-gray-600 bg-gray-700 hover:bg-gray-600"
                }
              `}
            >
              <Minus className="h-4 w-4 text-gray-300" />
            </button>

            <span className="min-w-[24px] text-center text-white">
              {item.quantity}
            </span>

            <button
              onClick={increaseQty}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600"
            >
              <Plus className="h-4 w-4 text-gray-300" />
            </button>
          </div>

          {/* PRICE */}
          <div className="w-28 text-right">
            <p className="text-base font-bold text-emerald-400">
              KES {(item.price * item.quantity).toLocaleString("en-KE")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
