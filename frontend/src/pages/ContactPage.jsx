import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactPage = () => {
	return (
		<div className="min-h-screen bg-gray-950 text-gray-300">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

				<motion.h1
					className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-6 text-center"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Contact Us
				</motion.h1>

				<motion.p
					className="text-center text-lg text-gray-400 max-w-3xl mx-auto mb-12"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					Have a question, feedback, or need support? We’d love to hear from you. Reach out to Leemart E-Shop using the details below.
				</motion.p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
					{/* Email */}
					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Mail className="mx-auto h-8 w-8 text-emerald-400 mb-4" />
						<h3 className="text-lg font-semibold text-white mb-2">Email</h3>
						<p className="text-sm text-gray-400">support@leemart.co.ke</p>
					</motion.div>

					{/* Phone */}
					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Phone className="mx-auto h-8 w-8 text-emerald-400 mb-4" />
						<h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
						<p className="text-sm text-gray-400">+254 740694770</p>
					</motion.div>

					{/* Location */}
					<motion.div
						className="rounded-xl bg-gray-900 p-6 shadow text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<MapPin className="mx-auto h-8 w-8 text-emerald-400 mb-4" />
						<h3 className="text-lg font-semibold text-white mb-2">Location</h3>
						<p className="text-sm text-gray-400">Nairobi, Kenya</p>
					</motion.div>
				</div>

				{/* Simple Contact Form (UI only) */}
				<motion.div
					className="max-w-3xl mx-auto rounded-xl bg-gray-900 p-8 shadow"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
				>
					<h3 className="text-2xl font-semibold text-white mb-6 text-center">
						Send Us a Message
					</h3>

					<form className="space-y-4">
						<input
							type="text"
							placeholder="Your Name"
							className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
						<input
							type="email"
							placeholder="Your Email"
							className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
						<textarea
							rows="4"
							placeholder="Your Message"
							className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						></textarea>

						<button
							type="button"
							className="w-full rounded-md bg-emerald-500 py-3 text-white font-semibold hover:bg-emerald-600"
						>
							Send Message
						</button>
					</form>
				</motion.div>

			</div>
		</div>
	);
};

export default ContactPage;