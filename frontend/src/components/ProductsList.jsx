import { motion } from "framer-motion";
import { Trash, Star, ImageIcon } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = () => {
  const { products, deleteProduct, toggleFeaturedProduct, loading } = useProductStore();

  if (!products?.length) return <p className="text-center text-gray-400 py-10">No products found.</p>;

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {["Product", "Price", "Category", "Featured", "Actions"].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products.map((product) => {
            const mainImage = product.images?.[0] || null;

            return (
              <tr key={product._id} className="hover:bg-gray-700/60 transition">
                {/* PRODUCT */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}

                      {product.images?.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black/70 text-xs px-1 rounded text-white">
                          +{product.images.length - 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      {product.description && <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>}
                    </div>
                  </div>
                </td>

                {/* PRICE */}
                <td className="px-6 py-4 text-sm text-gray-300">
                  KES {Number(product.price).toLocaleString("en-KE")}
                </td>

                {/* CATEGORY */}
                <td className="px-6 py-4 text-sm text-gray-300 capitalize">{product.category}</td>

                {/* FEATURED */}
                <td className="px-6 py-4">
                  <button
                    disabled={loading}
                    onClick={() => toggleFeaturedProduct(product._id)}
                    className={`p-2 rounded-full transition ${
                      product.isFeatured
                        ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="p-2 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ProductsList;
