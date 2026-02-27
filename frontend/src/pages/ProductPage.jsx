import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { ShoppingCart } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useUserStore();
  const { fetchProductById, selectedProduct, products } = useProductStore();

  const cartItems = useCartStore(
    (state) => state.cart || state.cartItems || []
  );
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProductById(id);
    setSelectedSize(null);
    setActiveImage(0);
  }, [id, fetchProductById]);

  if (!selectedProduct)
    return <p className="text-center py-20 text-gray-300">Loading...</p>;

  const isInCart = cartItems.some(
    (item) => item._id === selectedProduct._id
  );

  const inStock =
    selectedProduct.stock === undefined ||
    selectedProduct.stock > 0;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (isInCart) {
      toast("Already in cart");
      return;
    }

    addToCart({ ...selectedProduct, size: selectedSize });
    toast.success("Added to cart 🛒");
  };

  /* ================= SIZE LOGIC ================= */
  const shoeCategories = ["shoes", "sandals"];
  const isShoe = shoeCategories.includes(
    selectedProduct?.category?.toLowerCase()
  );

  const sizeOptions = isShoe
    ? Array.from({ length: 9 }, (_, i) => 37 + i)
    : ["S", "M", "L", "XL", "2XL"];

  const images = selectedProduct.images?.length
    ? selectedProduct.images
    : selectedProduct.image
    ? [selectedProduct.image]
    : [];

  const mainImage = images[activeImage] || images[0];

  const relatedProducts = products
    .filter(
      (p) =>
        p.category === selectedProduct.category &&
        p._id !== selectedProduct._id
    )
    .slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{selectedProduct.name} | Leemart</title>
        <meta
          name="description"
          content={selectedProduct.description}
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-20 text-white">
        <div className="grid md:grid-cols-2 gap-10">
          {/* IMAGE */}
          <div>
            <img
              src={mainImage}
              alt={selectedProduct.name}
              className="w-full rounded-xl object-cover"
            />

            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 cursor-pointer rounded border object-cover ${
                      activeImage === idx
                        ? "border-emerald-500"
                        : "border-gray-700"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">
              {selectedProduct.name}
            </h1>

            <p className="mt-4 text-gray-300">
              {selectedProduct.description}
            </p>

            <p className="mt-6 text-3xl font-bold">
              KES {selectedProduct.price.toLocaleString("en-KE")}
            </p>

            {/* SIZE */}
            <div className="mt-6">
              <p className="mb-2 text-sm text-gray-400">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded border text-sm ${
                      selectedSize === size
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-gray-700 hover:border-emerald-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <div className="mt-6">
              <button
                onClick={handleAddToCart}
                disabled={isInCart || !inStock}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition ${
                  isInCart || !inStock
                    ? "cursor-not-allowed bg-gray-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <ShoppingCart size={18} />
                {isInCart
                  ? "In Cart"
                  : !inStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">
              Related Products
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="rounded-lg border border-gray-700 p-4 hover:border-emerald-500 transition"
                >
                  <img
                    src={product.images?.[0] || product.image}
                    className="h-40 w-full object-cover rounded"
                  />
                  <p className="mt-2 font-semibold">
                    {product.name}
                  </p>
                  <p className="text-emerald-400">
                    KES{" "}
                    {product.price.toLocaleString("en-KE")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductPage;