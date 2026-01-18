import { Link } from "react-router-dom";
import {
	Facebook,
	Instagram,
	Twitter,
	MessageCircle,
	MapPin,
	Phone,
} from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gray-900 border-t border-emerald-800 mt-20">
			<div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">

				{/* Brand */}
				<div>
					<h2 className="text-2xl font-bold text-emerald-400 mb-3">
						Leemart Enterprise
					</h2>
					<p className="text-gray-400 text-sm mb-4">
						Your trusted destination for quality products, unbeatable deals,
						and secure payments.
					</p>

					<div className="space-y-2 text-gray-400 text-sm">
						<p className="flex items-center gap-2">
							<MapPin size={16} /> Nairobi, Kenya
						</p>
						<p className="flex items-center gap-2">
							<Phone size={16} /> +254 715536285
						</p>
					</div>
				</div>

				{/* Quick Links */}
				<div>
					<h3 className="text-lg font-semibold text-white mb-3">
						Quick Links
					</h3>
					<ul className="space-y-2 text-gray-400">
						<li><Link to="/" className="hover:text-emerald-400 transition-colors duration-200">Home</Link></li>
						<li><Link to="/about" className="hover:text-emerald-400 transition-colors duration-200">About</Link></li>
						<li><Link to="/contact" className="hover:text-emerald-400 transition-colors duration-200">Contact</Link></li>
						<li><Link to="/privacy" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link></li>
					</ul>
				</div>

				{/* Categories */}
				<div>
					<h3 className="text-lg font-semibold text-white mb-3">
						Categories
					</h3>
					<ul className="space-y-2 text-gray-400">
						<li><Link to="/category/jeans" className="hover:text-emerald-400 transition-colors duration-200">Jeans</Link></li>
						<li><Link to="/category/t-shirts" className="hover:text-emerald-400 transition-colors duration-200">T-Shirts</Link></li>
						<li><Link to="/category/shoes" className="hover:text-emerald-400 transition-colors duration-200">Shoes</Link></li>
						<li><Link to="/category/bags" className="hover:text-emerald-400 transition-colors duration-200">Bags</Link></li>
					</ul>
				</div>

				{/* Payments */}
				<div aria-label="Supported payment methods">
					<h3 className="text-lg font-semibold text-white mb-3">
						Secure Payments
					</h3>

					<div className="flex items-center gap-4">
						<img src="/payments/mpesa.png" alt="MPESA payment" loading="lazy" className="h-8 object-contain" />
						<img src="/payments/visa.png" alt="Visa payment" loading="lazy" className="h-8 object-contain" />
						<img src="/payments/mastercard.png" alt="Mastercard payment" loading="lazy" className="h-8 object-contain" />
					</div>

					<p className="text-gray-500 text-xs mt-3">
						All payments are processed securely.
					</p>
				</div>

				{/* Social */}
				<div>
					<h3 className="text-lg font-semibold text-white mb-3">
						Connect With Us
					</h3>

					<div className="flex items-center gap-4 mb-4">
						<a href="https://web.facebook.com/leemartInvestments" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
							<Facebook size={20} />
						</a>
						<a href="https://www.instagram.com/leemartent/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
							<Instagram size={20} />
						</a>
						<a href="https://x.com/LeemartEnt" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
							<Twitter size={20} />
						</a>
						<a href="https://wa.me/254715536285" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
							<MessageCircle size={20} />
						</a>
					</div>

					<p className="text-gray-500 text-xs">
						We respond fast on WhatsApp
					</p>
				</div>

			</div>

			{/* Bottom Bar */}
			<div className="border-t border-gray-800 py-4 text-center text-gray-500 text-sm">
				© {new Date().getFullYear()} Leemart Enterprise. All rights reserved.
			</div>
		</footer>
	);
};

export default Footer;
