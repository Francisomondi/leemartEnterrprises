import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  /* ================= MPESA ================= */
 const handleMpesaPayment = async () => {
	if (!phone) {
		setMpesaMessage(" Enter phone number");
		return;
	}
		let formattedPhone = phone.trim();
		if (formattedPhone.startsWith("0")) {
		formattedPhone = "254" + formattedPhone.slice(1);
		}

	// Basic validation
	if (!/^0(7|1)\d{8}$/.test(formattedPhone)) {
		setMpesaMessage("Enter a valid Safaricom number");
		return;
	}

	setLoadingMpesa(true);
	setMpesaMessage("");

	try {
		const res = await axios.post("/mpesa/stk",
			{
				phone: formattedPhone,
				amount: SVGAnimatedNumber(selectedProduct.price),

			},
			 { timeout: 25000 }
		);

		console.log("MPESA RESPONSE:", res.data);
		setMpesaMessage("📲 Check your phone to complete payment");
		
	} catch (error) {
			console.error("MPESA ERROR:", error);
			setMpesaMessage(
				error.response?.data?.message ||
				"Failed to send STK push"
			);
			}
			finally {
			setLoadingMpesa(false);
			}

};

  if (isLoading) {
    return <p className="text-center py-20 text-gray-300">Loading...</p>;
  }

  if (!selectedProduct) {
    return <p className="text-center py-20">Product not found</p>;
  }

  const images = selectedProduct.images?.length   ? selectedProduct.images : selectedProduct.image ? [selectedProduct.image] : [];
  const mainImage = images[activeImage] || images[0];

  /* ================= RELATED ================= */
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

          {/* IMAGE GALLERY */}
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
                    className={`h-20 w-20 cursor-pointer rounded border object-cover
                      ${
                        activeImage === idx
                          ? "border-emerald-500"
                          : "border-gray-700"
                      }
                    `}
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

            {/* MPESA */}
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-6 w-full rounded bg-gray-900 px-4 py-2 text-white"
            />

            <motion.button
              type="button"
              onClick={handleMpesaPayment}
              disabled={loadingMpesa}
              whileHover={!loadingMpesa ? { scale: 1.05 } : {}}
              whileTap={!loadingMpesa ? { scale: 0.95 } : {}}
              className={`mt-4 w-full rounded-lg px-5 py-2.5 font-medium text-white
                ${
                  loadingMpesa
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }
              `}
            >
              {loadingMpesa
                ? "📲 Waiting for phone prompt..."
                : "Buy now with M-PESA"}
            </motion.button>

            {mpesaMessage && (
              <p className="mt-3 text-center text-sm text-emerald-400">
                {mpesaMessage}
              </p>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="rounded-lg border border-gray-700 p-4 hover:scale-105 transition"
                >
                  <img
                    src={product.images?.[0] || product.image}
                    className="h-40 w-full object-cover rounded"
                  />
                  <p className="mt-2 font-semibold">{product.name}</p>
                  <p className="text-emerald-400">
                    KES {product.price.toLocaleString("en-KE")}
                  </p>
                       <button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full rounded bg-emerald-600 py-2 text-sm font-medium hover:bg-emerald-700"
                        >
                        Add to Cart
                      </button>
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
