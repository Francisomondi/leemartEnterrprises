import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";

const categories = ["Pants", "t-shirts", "shoes", "sandals", "jackets", "suits", "bags","dresses","two-piece","Woodies","Shorts","Hats"];


const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [], // now supports multiple images
  });

  const { createProduct, loading } = useProductStore();

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!newProduct.images.length) {
    toast.error("Please select at least one image");
    return;
  }

  const formData = new FormData();
  formData.append("name", newProduct.name);
  formData.append("description", newProduct.description);
  formData.append("price", newProduct.price);
  formData.append("category", newProduct.category);

  newProduct.images.forEach((img) => {
    formData.append("images", img);
  });

  try {
    await createProduct(formData);
    toast.success("Product created successfully!");
    setNewProduct({ name: "", description: "", price: "", category: "", images: [] });
  } catch (err) {
    toast.error("Failed to create product");
  }
};


 const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  setNewProduct({ ...newProduct, images: files });
};
  return (
    <motion.div
      className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Create New Product</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Name */}
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-gray-300'>Product Name</label>
          <input
            type='text'
            id='name'
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor='description' className='block text-sm font-medium text-gray-300'>Description</label>
          <textarea
            id='description'
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows='3'
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor='price' className='block text-sm font-medium text-gray-300'>Price</label>
          <input
            type='number'
            id='price'
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            step='0.01'
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor='category' className='block text-sm font-medium text-gray-300'>Category</label>
          <select
            id='category'
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          >
            <option value=''>Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <input
            type='file'
            multiple
            id='images'
            className='sr-only'
            accept='image/*'
            onChange={handleImageChange}
          />
          <label
            htmlFor='images'
            className='cursor-pointer bg-gray-700 py-2 px-3 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 flex items-center'
          >
            <Upload className='h-5 w-5 mr-2' />
            Upload Images
          </label>
          {newProduct.images.length > 0 && (
            <p className='mt-2 text-sm text-gray-400'>{newProduct.images.length} image(s) selected</p>
          )}
        </div>

        {/* Submit */}
        <button
          type='submit'
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 rounded-md text-white font-medium ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading ? <Loader className='animate-spin mr-2 h-5 w-5' /> : <PlusCircle className='mr-2 h-5 w-5' />} Create Product
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
