import { motion } from "framer-motion";

const AboutPage = () => {
	return (
		<div className="min-h-screen bg-gray-950 text-gray-300">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<motion.h1
					className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-6 text-center"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					About Leemart E-Shop
				</motion.h1>

				<motion.p
					className="text-center text-lg text-gray-400 max-w-3xl mx-auto mb-12"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					Leemart E-Shop is your trusted online marketplace for quality fashion, accessories, and everyday essentials. We are committed to delivering value, style, and convenience to customers across Kenya.
				</motion.p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<h3 className="text-xl font-semibold text-white mb-2">Our Mission</h3>
						<p className="text-sm text-gray-400">
							To provide affordable, high-quality products while offering a seamless and secure shopping experience for everyone.
						</p>
					</motion.div>

					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<h3 className="text-xl font-semibold text-white mb-2">What We Offer</h3>
						<p className="text-sm text-gray-400">
							Fashion-forward clothing, shoes, bags, and accessories curated to match your lifestyle and budget.
						</p>
					</motion.div>

					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<h3 className="text-xl font-semibold text-white mb-2">Why Choose Us</h3>
						<p className="text-sm text-gray-400">
							Fast delivery, reliable support, secure payments (including M-Pesa), and customer-first service.
						</p>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default AboutPage;