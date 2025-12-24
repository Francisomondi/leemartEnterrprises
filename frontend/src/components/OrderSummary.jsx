import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState } from "react";

const stripePromise = loadStripe(
	"pk_test_51QECS1CuN2A0ZRg3Rd2xBu36onklMc2SDdezYRPo6C4Wuju4UkxQye229izbiYPtwK6t08g7WCaDzV0NZEoTMR1C00Gbcr6sIs"
);

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	const [phone, setPhone] = useState("");
	const [loadingMpesa, setLoadingMpesa] = useState(false);
	const [mpesaMessage, setMpesaMessage] = useState("");

	const savings = subtotal - total;

	const formattedSubtotal = subtotal.toLocaleString("en-KE");
	const formattedTotal = total.toLocaleString("en-KE");
	const formattedSavings = savings.toLocaleString("en-KE");

	// 💳 STRIPE
	const handlePayment = async () => {
		const stripe = await stripePromise;
		const res = await axios.post("/payments/create-checkout-session", {
			products: cart,
			couponCode: coupon ? coupon.code : null,
		});

		const session = res.data;
		const result = await stripe.redirectToCheckout({
			sessionId: session.id,
		});

		if (result.error) console.error(result.error);
	};

	// 📲 MPESA
	const handleMpesaPayment = async () => {
	if (!phone) {
		setMpesaMessage(" Enter phone number");
		return;
	}

	// Normalize phone number
	let formattedPhone = phone.trim();

	// If user enters 2547XXXXXXXX → convert to 07XXXXXXXX
	if (formattedPhone.startsWith("254")) {
		formattedPhone = "0" + formattedPhone.slice(3);
	}

	// Basic validation
	if (!/^0(7|1)\d{8}$/.test(formattedPhone)) {
		setMpesaMessage("Enter a valid Safaricom number");
		return;
	}

	setLoadingMpesa(true);
	setMpesaMessage("");

	try {
		const res = await axios.post("/mpesa/stk-push",
			{
				phone: formattedPhone,
				amount: total,

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


	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex justify-between'>
						<dt className='text-gray-300'>Original price</dt>
						<dd className='text-white'>KES {formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex justify-between'>
							<dt className='text-gray-300'>Savings</dt>
							<dd className='text-emerald-400'>-KES {formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex justify-between'>
							<dt className='text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}

					<dl className='flex justify-between border-t border-gray-600 pt-2'>
						<dt className='font-bold'>Total</dt>
						<dd className='font-bold text-emerald-400'>
							KES {formattedTotal}
						</dd>
					</dl>
				</div>

				{/* STRIPE */}
				<motion.button
					className='w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePayment}
				>
					Proceed to Checkout (Card)
				</motion.button>

				{/* MPESA INPUT */}
				<input
					type='tel'
					placeholder='07XXXXXXXX'
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className='w-full rounded bg-gray-900 px-4 py-2 text-white'
				/>

				{/* MPESA BUTTON */}
						<motion.button
							type="button"
							onClick={handleMpesaPayment}
							disabled={loadingMpesa}
							whileHover={!loadingMpesa ? { scale: 1.05 } : {}}
							whileTap={!loadingMpesa ? { scale: 0.95 } : {}}
							className={`w-full rounded-lg px-5 py-2.5 font-medium text-white transition
								${loadingMpesa
									? "bg-gray-600 cursor-not-allowed"
									: "bg-emerald-600 hover:bg-emerald-700"}
							`}
						>
							{loadingMpesa ? "📲 Waiting for phone prompt..." : "Pay with M-PESA"}
						</motion.button>


				{mpesaMessage && (
					<p className='text-center text-sm text-emerald-400'>
						{mpesaMessage}
					</p>
				)}

				<div className='flex justify-center gap-2'>
					<span className='text-gray-400'>or</span>
					<Link
						to='/'
						className='text-emerald-400 underline hover:text-emerald-300'
					>
						Continue Shopping <MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummary;
