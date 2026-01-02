import toast from "react-hot-toast";
import { ShoppingCart, Zap } from "lucide-react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();

	const cartItems = useCartStore(
		(state) => state.cart || state.cartItems || []
	);
	const addToCart = useCartStore((state) => state.addToCart);

	const isInCart = cartItems.some((item) => item._id === product._id);
	const inStock = product.stock === undefined || product.stock > 0;

	/* ================= ADD TO CART ================= */
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart");
			return;
		}
		if (isInCart) {
			toast("Already in cart");
			return;
		}

		addToCart(product);
		
	};

	/* ================= BUY NOW (MPESA) ================= */
	
	return (
		<div className='group relative flex w-full flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20'>
			
			{/* IMAGE */}
			<Link to={`/product/${product._id}`}>
				<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<img
					className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
					src={product.image}
					alt={product.name}
				/>
				<div className='absolute inset-0 bg-black/20' />

				{/* STOCK BADGE */}
				<span
					className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold ${
						inStock ? "bg-emerald-600" : "bg-red-600"
					}`}
				>
					{inStock ? "In Stock" : "Out of Stock"}
				</span>
			</div>
			</Link>
			

			{/* CONTENT */}
			<div className='mt-4 px-5 pb-5'>
				<Link
					to={`/product/${product._id}`}
					className='hover:text-emerald-400'
				>
					<h5 className='text-xl font-semibold text-white'>
						{product.name}
					</h5>
				</Link>


				<p className='mt-2 text-3xl font-bold text-emerald-400'>
					KES {product.price}
				</p>

				{/* ACTION BUTTONS */}
				<div className='mt-4 space-y-2'>
					<button
						onClick={handleAddToCart}
						disabled={isInCart || !inStock}
						className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
							isInCart || !inStock
								? "cursor-not-allowed bg-gray-600"
								: "bg-emerald-600 hover:bg-emerald-700"
						}`}
					>
						<ShoppingCart size={20} className='mr-2' />
						{isInCart ? "In Cart" : "Add to Cart"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
