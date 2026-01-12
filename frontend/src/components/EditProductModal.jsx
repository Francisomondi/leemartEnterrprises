import { useState, useEffect } from "react";

const EditProductModal = ({ product, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
        description: product.description || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("✅ SAVE CLICKED");
    console.log("📦 DATA BEING SENT:", formData);

    try {
      await onSave(formData);
      console.log("✅ SAVE SUCCESS");
    } catch (err) {
      console.error("❌ SAVE FAILED", err);
      alert("Update failed — check console");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-white text-lg font-semibold">Edit Product</h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400"
          >
            Cancel
          </button>

          {/* ❗ ONLY submit, NO onClick */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductModal;
