import toast from "react-hot-toast";
import { ShoppingCart, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();

  const cartItems = useCartStore(
    (state) => state.cart || state.cartItems || []
  );
  const addToCart = useCartStore((state) => state.addToCart);

  const isInCart = cartItems.some((item) => item._id === product._id);
  const inStock = product.stock === undefined || product.stock > 0;

  const images = product.images || [];
  const mainImage = images[0];

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }

    if (isInCart) {
      toast("Already in cart");
      return;
    }

    addToCart(product);
    toast.success("Added to cart");
  };

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-lg transition hover:-translate-y-1 hover:shadow-emerald-500/20">
      
      {/* IMAGE */}
      <Link to={`/product/${product._id}`}>
        <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl bg-gray-700">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-gray-400" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/20" />

          {/* STOCK BADGE */}
          <span
            className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold text-white ${
              inStock ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>

          {/* IMAGE COUNT */}
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
              +{images.length - 1}
            </span>
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="mt-4 px-5 pb-5">
        <Link to={`/product/${product._id}`} className="hover:text-emerald-400">
          <h5 className="text-lg font-semibold text-white line-clamp-1">
            {product.name}
          </h5>
        </Link>

        <p className="mt-2 text-2xl font-bold text-emerald-400">
          KES {Number(product.price).toLocaleString("en-KE")}
        </p>

        {/* ACTIONS */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isInCart || !inStock}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
              isInCart || !inStock
                ? "cursor-not-allowed bg-gray-600"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <ShoppingCart size={18} />
            {isInCart ? "In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
