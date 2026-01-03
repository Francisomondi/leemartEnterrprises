import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const FeaturedProducts = ({ featuredProducts = [] }) => {
	const { addToCart } = useCartStore();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);

	// 🔹 Responsive items per page
	useEffect(() => {
		const handleResize = () => {
			const w = window.innerWidth;
			if (w < 640) setItemsPerPage(1);
			else if (w < 1024) setItemsPerPage(2);
			else if (w < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// 🔹 Max index protection
	const maxIndex = Math.max(featuredProducts.length - itemsPerPage, 0);

	const nextSlide = () => {
		setCurrentIndex((prev) => Math.min(prev + itemsPerPage, maxIndex));
	};

	const prevSlide = () => {
		setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
	};

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= maxIndex;

	// 🔹 Early return if no products
	if (!featuredProducts.length) {
		return (
			<div className="py-12 text-center text-gray-400">
				No featured products available.
			</div>
		);
	}

	return (
		<section className="py-12">
			<div className="container mx-auto px-4">
				<h2 className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8">
					Featured Products
				</h2>

				<div className="relative">
					<div className="overflow-hidden">
						<div
							className="flex transition-transform duration-500 ease-out"
							style={{
								transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
							}}
						>
							{featuredProducts.map((product) => (
								<div
									key={product._id}
									className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-3"
								>
									<div className="h-full bg-white/10 backdrop-blur rounded-xl border border-emerald-500/20 shadow hover:shadow-xl transition">
										<Link to={`/product/${product._id}`}>
											<div className="overflow-hidden rounded-t-xl">
												<img
													src={product.images?.[0] || "/placeholder.jpg"}
													alt={product.name}
													loading="lazy"
													onError={(e) => {
														e.currentTarget.src = "/placeholder.jpg";
													}}
													className="w-full h-48 object-cover"
												/>
											</div>
										</Link>

										<div className="p-4 flex flex-col h-full">
											<h3 className="text-lg font-semibold text-white mb-1 truncate">
												{product.name}
											</h3>

											<p className="text-emerald-300 font-medium mb-4">
												KES {product.price?.toLocaleString("en-KE")}
											</p>

											<button
												onClick={() => addToCart(product)}
												className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
											>
												<ShoppingCart className="w-4 h-4" />
												Add to Cart
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Left Arrow */}
					<button
						onClick={prevSlide}
						disabled={isStartDisabled}
						aria-label="Previous products"
						className={`absolute top-1/2 -left-4 -translate-y-1/2 rounded-full p-2 transition ${
							isStartDisabled
								? "bg-gray-600 cursor-not-allowed"
								: "bg-emerald-600 hover:bg-emerald-500"
						}`}
					>
						<ChevronLeft className="w-6 h-6 text-white" />
					</button>

					{/* Right Arrow */}
					<button
						onClick={nextSlide}
						disabled={isEndDisabled}
						aria-label="Next products"
						className={`absolute top-1/2 -right-4 -translate-y-1/2 rounded-full p-2 transition ${
							isEndDisabled
								? "bg-gray-600 cursor-not-allowed"
								: "bg-emerald-600 hover:bg-emerald-500"
						}`}
					>
						<ChevronRight className="w-6 h-6 text-white" />
					</button>
				</div>
			</div>
		</section>
	);
};

export default FeaturedProducts;
