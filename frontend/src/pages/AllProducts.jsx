import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";


const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/products");
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-emerald-400 text-xl animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // ---------------- EMPTY ----------------
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-400 text-lg">
          No products available at the moment.
        </p>
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-emerald-400 text-center mb-12"
      >
        All Products
      </motion.h1>

      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full object-cover hover:scale-105 transition"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-white truncate">
                {product.name}
              </h2>

              <p className="text-gray-400 text-sm line-clamp-2">
                {product.description}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-emerald-400 font-bold">
                  KES {product.price.toLocaleString("en-KE")}
                </span>

                <Link
                  to={`/product/${product._id}`}
                  className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  View
                </Link>
              </div>

              {product.countInStock === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  Out of stock
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AllProducts;