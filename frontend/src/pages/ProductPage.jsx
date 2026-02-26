import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import axios from "../lib/axios";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";


const ProductPage = () => {
  const { id } = useParams();
  const { fetchProductById, selectedProduct, isLoading, products } =
    useProductStore();

  const [activeImage, setActiveImage] = useState(0);
  const [phone, setPhone] = useState("");
  const [loadingMpesa, setLoadingMpesa] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  const { addToCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductById(id);
    setSelectedSize(null);
  }, [id, fetchProductById]);

  // SIZE LOGIC
  const shoeCategories = ["shoes", "sandals"];
  const isShoe = shoeCategories.includes(
    selectedProduct?.category?.toLowerCase()
  );
  const sizeOptions = isShoe
    ? Array.from({ length: 9 }, (_, i) => 37 + i)
    : ["S", "M", "L", "XL", "2XL"];

  // MPESA PAYMENT
  const handleMpesaPayment = async () => {
  if (!phone) return toast.error("Enter phone number");
  if (!selectedSize) return toast.error("Please select a size");

  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith("254")) {
    formattedPhone = "0" + formattedPhone.slice(3);
  }

  if (!/^0(7|1)\d{8}$/.test(formattedPhone)) {
    return toast.error("Enter a valid Safaricom number");
  }

  try {
    setLoadingMpesa(true);

    // ✅ 1. CREATE ORDER
   const orderRes = await axios.post("/orders", {
  items: [
    {
      product: selectedProduct._id,
      quantity: 1,
      size: selectedSize,
    },
  ],
}); 

const orderId = orderRes.data._id;

    // ✅ 2. SEND MPESA WITH REAL ORDER ID
    const payload = {
      phone: formattedPhone,
      amount: selectedProduct.price,
      orderId: orderId,
    };

    console.log("MPESA PAYLOAD:", payload);

    const res = await axios.post("/mpesa/stk", payload, {
      timeout: 25000,
    });

    toast.success("📲 Check your phone");

    pollPaymentStatus(res.data.checkoutRequestID);
  } catch (error) {
    console.error("MPESA ERROR:", error);
    toast.error(error.response?.data?.message || "Payment failed");
  } finally {
    setLoadingMpesa(false);
  }
};

  const pollPaymentStatus = (checkoutRequestID) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/mpesa/status/${checkoutRequestID}`);
        if (res.data.status === "SUCCESS") {
          clearInterval(interval);
          toast.success("✅ Payment successful!");
          clearCart();
          setTimeout(() => navigate("/"), 1500);
        }
        if (res.data.status === "FAILED") {
          clearInterval(interval);
          toast.error("❌ Payment failed");
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  if (isLoading) return <p className="text-center py-20 text-gray-300">Loading...</p>;
  if (!selectedProduct) return <p className="text-center py-20">Product not found</p>;

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
        <meta name="description" content={selectedProduct.description} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-20 text-white">
        <div className="grid md:grid-cols-2 gap-10">
          {/* IMAGE */}
          <div>
            <img src={mainImage} alt={selectedProduct.name} className="w-full rounded-xl object-cover" />
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 cursor-pointer rounded border object-cover ${
                      activeImage === idx ? "border-emerald-500" : "border-gray-700"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">{selectedProduct.name}</h1>
            <p className="mt-4 text-gray-300">{selectedProduct.description}</p>
            <p className="mt-6 text-3xl font-bold">KES {selectedProduct.price.toLocaleString("en-KE")}</p>

            {/* SIZE */}
            <div className="mt-6">
              <p className="mb-2 text-sm text-gray-400">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded border text-sm ${
                      selectedSize === size ? "bg-emerald-600 border-emerald-600" : "border-gray-700 hover:border-emerald-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={() => addToCart({ ...selectedProduct, selectedSize })}
              className="mt-6 w-full rounded bg-emerald-600 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              Add to Cart
            </button>

            {/* MPESA */}
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-4 w-full rounded bg-gray-900 px-4 py-2"
            />
            <motion.button
              onClick={handleMpesaPayment}
              disabled={loadingMpesa}
              className="mt-4 w-full rounded bg-emerald-600 py-2 font-medium"
            >
              {loadingMpesa ? "Sending STK..." : "Pay Now via M-pesa"}
            </motion.button>

            

            {mpesaMessage && <p className="mt-3 text-center text-sm text-emerald-400">{mpesaMessage}</p>}
          </div>
        </div>

        {/* RELATED */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="rounded-lg border border-gray-700 p-4">
                  <img src={product.images?.[0] || product.image} className="h-40 w-full object-cover rounded" />
                  <p className="mt-2 font-semibold">{product.name}</p>
                  <p className="text-emerald-400">KES {product.price.toLocaleString("en-KE")}</p>
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