import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const ProductPage = () => {
	const { id } = useParams();
	const { fetchProductById, selectedProduct, isLoading, products } =
		useProductStore();

	const [phone, setPhone] = useState("");
	const [loadingMpesa, setLoadingMpesa] = useState(false);

	useEffect(() => {
		fetchProductById(id);
	}, [id]);

	const handleBuyNowMpesa = async () => {
		if (!phone) return toast.error("Enter phone number");

		try {
			setLoadingMpesa(true);
			await axios.post("/mpesa/stk-push", {
				phone,
				amount: selectedProduct.price,
			});
			toast.success("📲 Check your phone");
		} catch {
			toast.error("MPESA failed");
		} finally {
			setLoadingMpesa(false);
		}
	};

	if (isLoading) return <p className="text-center">Loading...</p>;
	if (!selectedProduct) return <p>Product not found</p>;

	/* RELATED PRODUCTS */
	const relatedProducts = products
		.filter(
			(p) =>
				p.category === selectedProduct.category &&
				p._id !== selectedProduct._id
		)
		.slice(0, 4);

	return (
		<>
			
		
				<title>{selectedProduct.name} | Leemart</title>
				<meta
					name="description"
					content={selectedProduct.description}
				/>	

			<div className="max-w-6xl mx-auto px-4 py-20 text-white">
				<div className="grid md:grid-cols-2 gap-10">
					<img
						src={selectedProduct.image}
						alt={selectedProduct.name}
						className="rounded-xl"
					/>

					<div>
						<h1 className="text-4xl font-bold text-emerald-400">
							{selectedProduct.name}
						</h1>

						<p className="mt-4 text-gray-300">
							{selectedProduct.description}
						</p>

						<p className="mt-6 text-3xl font-bold">
							KES {selectedProduct.price}
						</p>

						{/* MPESA BUY NOW */}
						<input
							type="tel"
							placeholder="2547XXXXXXXX"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="mt-6 w-full rounded bg-gray-900 px-4 py-2 text-white"
						/>

						<button
							onClick={handleBuyNowMpesa}
							disabled={loadingMpesa}
							className="mt-4 w-full rounded-lg bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
						>
							{loadingMpesa
								? "Processing..."
								: "Buy Now with MPESA"}
						</button>
					</div>
				</div>

				{/* RELATED PRODUCTS */}
				{relatedProducts.length > 0 && (
					<div className="mt-20">
						<h2 className="text-2xl font-bold mb-6">
							Related Products
						</h2>

						<div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
							{relatedProducts.map((product) => (
								<div
									key={product._id}
									className="border border-gray-700 rounded-lg p-4 hover:scale-105 transition"
								>
									<img
										src={product.image}
										className="h-40 w-full object-cover rounded"
									/>
									<p className="mt-2 font-semibold">
										{product.name}
									</p>
									<p className="text-emerald-400">
										KES {product.price}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ProductPage;
