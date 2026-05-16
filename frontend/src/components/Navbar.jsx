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
  const { cart = [] } = useCartStore();

  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-emerald-900/40 bg-gray-900/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0"
          >
            <img
              src="/logo.png"
              alt="Leemart Logo"
              className="h-11 w-auto object-contain md:h-14"
              loading="lazy"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-5 md:flex">
            <Link
              to="/"
              className="text-sm text-gray-300 transition hover:text-emerald-400"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-sm text-gray-300 transition hover:text-emerald-400"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm text-gray-300 transition hover:text-emerald-400"
            >
              Contact
            </Link>
			

            {/* CART */}
            {user && (
              <Link
                to="/cart"
                className="relative text-gray-300 transition hover:text-emerald-400"
              >
                <ShoppingCart size={22} />

                {cart.length > 0 && (
                  <span className="absolute -left-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {/* ADMIN */}
            {isAdmin && (
              <Link
                to="/secret-dashboard"
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Lock size={16} />
                Dashboard
              </Link>
            )}

            {/* AUTH */}
            {user ? (
              <>
                {/* PROFILE */}
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-800"
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.name || "User"}
                    className="h-10 w-10 rounded-full border-2 border-emerald-500 object-cover"
                  />

                  <div className="hidden max-w-[140px] flex-col md:flex">
                    <span className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </span>

                    <span className="text-xs text-gray-400">
                      My Profile
                    </span>
                  </div>
                </Link>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
                >
                  <UserPlus size={18} />
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-300 transition hover:text-white md:hidden"
            aria-label="Toggle Menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="space-y-3 border-t border-gray-800 py-4 md:hidden">
            {/* MOBILE PROFILE */}
            {user && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl bg-gray-800 p-3 transition hover:bg-gray-700"
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name || "User"}
                  className="h-12 w-12 rounded-full border-2 border-emerald-500 object-cover"
                />

                <div>
                  <p className="font-semibold text-white">
                    {user.name}
                  </p>

                  <p className="text-sm text-gray-400">
                    View Profile
                  </p>
                </div>
              </Link>
            )}

            {/* LINKS */}
            <Link
              to="/"
              onClick={closeMenu}
              className="block text-gray-300 transition hover:text-emerald-400"
            >
              Home
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
              className="block text-gray-300 transition hover:text-emerald-400"
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
              className="block text-gray-300 transition hover:text-emerald-400"
            >
              Contact
            </Link>

            {/* CART */}
            {user && (
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center gap-2 text-gray-300 transition hover:text-emerald-400"
              >
                <ShoppingCart size={18} />
                Cart ({cart.length})
              </Link>
            )}

            {/* ADMIN */}
            {isAdmin && (
              <Link
                to="/secret-dashboard"
                onClick={closeMenu}
                className="block rounded-md bg-emerald-600 px-4 py-2 text-center text-white transition hover:bg-emerald-700"
              >
                Admin Dashboard
              </Link>
            )}

            {/* AUTH */}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-md bg-gray-700 py-2 text-white transition hover:bg-gray-600"
              >
                Log Out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block rounded-md bg-emerald-600 py-2 text-center text-white transition hover:bg-emerald-700"
                >
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block rounded-md bg-gray-700 py-2 text-center text-white transition hover:bg-gray-600"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;