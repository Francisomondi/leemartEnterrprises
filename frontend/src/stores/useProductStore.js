import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	
	products: [],
	selectedProduct: null,
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (formData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products",
			formData
			);
			set((state) => ({ products: [res.data, ...state.products] }));
		} finally {
			set({ loading: false });
		}
	},
    updateProduct: async (id, data) => {
		set({ loading: true });
		try {
			const res = await axios.patch(`/products/${id}`, data);

			set((state) => ({
			products: state.products.map((p) =>
				p._id === id ? res.data : p
			),
			loading: false,
			}));
			return res.data
		} catch (err) {
			set({ loading: false });
			throw err;
		}
	},


	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductById: async (id) => {
		set({ isLoading: true, selectedProduct: null });

		try {
			const res = await axios.get(`/products/${id}`);
			set({ selectedProduct: res.data, isLoading: false });
		} catch (error) {
			console.error("Fetch product error:", error);
			set({ isLoading: false });
		}
	},

	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));
