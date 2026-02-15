import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";

const categories = [
  "Pants",
  "t-shirts",
  "shoes",
  "sandals",
  "jackets",
  "suits",
  "bags",
  "dresses",
  "two-piece",
  "Woodies",
  "Shorts",
  "Hats",
];

// 🔹 SIZE OPTIONS
const SHOE_SIZES = Array.from({ length: 9 }, (_, i) => i + 37);
const CLOTHING_SIZES = ["S", "M", "L", "XL", "2XL"];
const COLORS = ["Black", "White", "Brown", "Red", "Blue"];

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    sizes: [],
    colors: [],
  });

  const { createProduct, loading } = useProductStore();

  // 🔹 Toggle size
  const toggleSize = (size) => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // 🔹 Toggle color
  const toggleColor = (color) => {
    setNewProduct((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newProduct.images.length) {
      toast.error("Please select at least one image");
      return;
    }

    if (!newProduct.sizes.length) {
      toast.error("Please select at least one size");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("category", newProduct.category);

    newProduct.images.forEach((img) =>
      formData.append("images", img)
    );

    newProduct.sizes.forEach((size) =>
      formData.append("sizes", size)
    );

    newProduct.colors.forEach((color) =>
      formData.append("colors", color)
    );

    try {
      await createProduct(formData);
      toast.success("Product created successfully!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [],
        sizes: [],
        colors: [],
      });
    } catch {
      toast.error("Failed to create product");
    }
  };

  const handleImageChange = (e) => {
    setNewProduct({ ...newProduct, images: Array.from(e.target.files) });
  };

  const isFootwear =
    newProduct.category === "shoes" ||
    newProduct.category === "sandals";

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
          required
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          rows="3"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
          required
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
          required
        />

        {/* Category */}
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              category: e.target.value,
              sizes: [], // reset sizes on category change
            })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* 🔹 Sizes */}
        <div>
          <label className="text-sm text-gray-300">Sizes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(isFootwear ? SHOE_SIZES : CLOTHING_SIZES).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 rounded border ${
                  newProduct.sizes.includes(size)
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="text-sm text-gray-300">Colors</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-3 py-1 rounded border ${
                  newProduct.colors.includes(color)
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="text-gray-300"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 rounded-md text-white ${
            loading
              ? "bg-gray-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading ? <Loader className="animate-spin" /> : "Create Product"}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
