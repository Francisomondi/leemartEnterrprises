import {
	ShoppingCart,
	UserPlus,
	LogIn,
	LogOut,
	Lock,
	Menu,
	X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const [open, setOpen] = useState(false);

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex justify-between items-center'>

					{/* Logo */}
					<Link
						to='/'
						className='text-2xl font-bold text-emerald-400 flex items-center'
					>
						Leemart Investments
					</Link>

					{/* Desktop Nav */}
					<nav className='hidden md:flex items-center gap-4'>
						<Link to='/' className='text-gray-300 hover:text-emerald-400 transition duration-300'>
							Home
						</Link>
						<Link to='/about' className='text-gray-300 hover:text-emerald-400 transition duration-300'>
							About
						</Link>
						<Link to='/contact' className='text-gray-300 hover:text-emerald-400 transition duration-300'>
							Contact
						</Link>

						{user && (
							<Link
								to='/cart'
								className='relative group text-gray-300 hover:text-emerald-400 transition duration-300'
							>
								<ShoppingCart size={20} />
								{cart.length > 0 && (
									<span className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs'>
										{cart.length}
									</span>
								)}
							</Link>
						)}

						{isAdmin && (
							<Link
								to='/secret-dashboard'
								className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md flex items-center transition'
							>
								<Lock size={18} className='mr-1' />
								Dashboard
							</Link>
						)}

						

						{user ? (
							<button
								onClick={logout}
								className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition'
							>
								<LogOut size={18} />
								<span className='ml-2 hidden sm:inline'>Log Out</span>
							</button>
						) : (
							<>
								<Link
									to='/signup'
									className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition'
								>
									<UserPlus size={18} className='mr-2' />
									Sign Up
								</Link>
								<Link
									to='/login'
									className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition'
								>
									<LogIn size={18} className='mr-2' />
									Login
								</Link>
							</>
						)}

						{user && (
							<Link
								to="/profile"
								className="
								flex items-center gap-2 sm:gap-3
								px-1 sm:px-2 py-1
								rounded-lg hover:bg-gray-800 transition
								flex-shrink-0
								"
							>
								<img
								src={user.avatar || "/default-avatar.png"}
								alt={user.name || "User avatar"}
								className="
									w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
									rounded-full object-cover
									border-2 border-emerald-500
									hover:ring-2 hover:ring-emerald-400
									transition
								"
								/>

								{/* Hide text on small screens to avoid crowding */}
								<div className="hidden md:flex flex-col leading-tight max-w-[140px]">
								<span className="text-sm font-semibold text-white truncate">
									{user.name}
								</span>
								<span className="text-xs text-gray-400">
									My Profile
								</span>
								</div>
							</Link>
						)}

					</nav>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setOpen(!open)}
						className='md:hidden text-gray-300'
					>
						{open ? <X size={26} /> : <Menu size={26} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{open && (
					<div className='md:hidden mt-4 space-y-3'>

						{user && (
						<Link
							to="/profile"
							onClick={() => setOpen(false)}
							className="
							flex items-center gap-4
							p-3 rounded-lg
							bg-gray-800 hover:bg-gray-700
							transition
							"
						>
							<img
							src={user.avatar || "/default-avatar.png"}
							alt={user.name || "User avatar"}
							className="
								w-12 h-12
								rounded-full object-cover
								border-2 border-emerald-500
							"
						/>

							<div className="flex flex-col leading-tight">
							<span className="text-base font-semibold text-white">
								{user.name}
							</span>
							<span className="text-sm text-gray-400">
								View Profile
							</span>
							</div>
						</Link>
						)}

						<Link onClick={() => setOpen(false)} to='/' className='block text-gray-300 hover:text-emerald-400'>
							Home
						</Link>
						<Link onClick={() => setOpen(false)} to='/about' className='block text-gray-300 hover:text-emerald-400'>
							About
						</Link>
						<Link onClick={() => setOpen(false)} to='/contact' className='block text-gray-300 hover:text-emerald-400'>
							Contact
						</Link>

						{user && (
							<Link
								onClick={() => setOpen(false)}
								to='/cart'
								className='flex items-center gap-2 text-gray-300 hover:text-emerald-400'
							>
								<ShoppingCart size={18} />
								Cart ({cart.length})
							</Link>
						)}

						{isAdmin && (
							<Link
								onClick={() => setOpen(false)}
								to='/secret-dashboard'
								className='block bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-md'
							>
								Admin Dashboard
							</Link>
						)}

						{user ? (
							<button
								onClick={logout}
								className='w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md'
							>
								Log Out
							</button>
						) : (
							<>
								<Link
									onClick={() => setOpen(false)}
									to='/signup'
									className='block bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-center'
								>
									Sign Up
								</Link>
								<Link
									onClick={() => setOpen(false)}
									to='/login'
									className='block bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md text-center'
								>
									Login
								</Link>
							</>
						)}
					</div>
				)}
			</div>
		</header>
	);
};

export default Navbar;
