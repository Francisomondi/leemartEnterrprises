import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-gray-300 mt-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">

					{/* Brand */}
					<div>
						<h3 className="text-2xl font-bold text-emerald-400">Leemart E-Shop</h3>
						<p className="mt-3 text-sm text-gray-400">
							Your trusted destination for quality products, great deals, and a smooth shopping experience.
						</p>
					</div>

					{/* Shop Links */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
						<ul className="space-y-2 text-sm">
							<li><Link to="/category/jeans" className="hover:text-emerald-400">Jeans</Link></li>
							<li><Link to="/category/t-shirts" className="hover:text-emerald-400">T-Shirts</Link></li>
							<li><Link to="/category/shoes" className="hover:text-emerald-400">Shoes</Link></li>
							<li><Link to="/category/bags" className="hover:text-emerald-400">Bags</Link></li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">Company</h4>
						<ul className="space-y-2 text-sm">
							<li><Link to="/about" className="hover:text-emerald-400">About Us</Link></li>
							<li><Link to="/contact" className="hover:text-emerald-400">Contact</Link></li>
							<li><Link to="/privacy" className="hover:text-emerald-400">Privacy Policy</Link></li>
							<li><Link to="/terms" className="hover:text-emerald-400">Terms & Conditions</Link></li>
						</ul>
					</div>

					{/* Social */}
					<div>
						<h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
						<div className="flex space-x-4">
							<a href="#" className="hover:text-emerald-400"><Facebook /></a>
							<a href="#" className="hover:text-emerald-400"><Instagram /></a>
							<a href="#" className="hover:text-emerald-400"><Twitter /></a>
						</div>
					</div>

				</div>

				<div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
					© {new Date().getFullYear()} Leemart E-Shop. All rights reserved.
				</div>
			</div>
		</footer>
	);
};

export default Footer;
