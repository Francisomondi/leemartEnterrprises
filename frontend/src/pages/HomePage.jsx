import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { motion } from "framer-motion";



const categories = [
  { href: "/pants", name: "Pants", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "Shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/sandals", name: "Sandals", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
  { href: "/dresses", name: "Dresses", imageUrl: "/dresses.jpg" },
  { href: "/twopiece", name: "TwoPiece", imageUrl: "/twopiece.jpg" },
  { href: "/hoodies", name: "Hoodies", imageUrl: "/hoodies.jpg" },
  { href: "/shorts", name: "Shorts", imageUrl: "/shorts.jpg" },
  { href: "/hats", name: "Hats", imageUrl: "/hats.jpeg" },
 
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-gray-900">
      
      {/* Hero Section */}
   <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-transparent to-transparent blur-3xl" />

      {/* Floating shapes */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-400 mb-6"
        >
          Welcome to <span className="text-white">Leemart</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl text-gray-300 mb-4"
        >
          Quality • Style • Everyday Convenience
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto text-lg text-gray-400 mb-12"
        >
          Shop confidently with secure payments, fast delivery, and products
          carefully selected to fit your lifestyle.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-14"
        >
          <a
            href="/products"
            className="px-10 py-4 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-lg"
          >
            🛒 Start Shopping
          </a>

          <a
            href="/products"
            className="px-10 py-4 rounded-full border border-gray-600 text-gray-300 hover:text-emerald-400 hover:border-emerald-400 transition"
          >
            🔥 View Deals
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mb-14"
        >
          <Badge icon="💳" text="MPESA & Card Payments" />
          <Badge icon="🚚" text="Fast Local Delivery" />
          <Badge icon="🔒" text="Secure Checkout" />
        </motion.div>

        {/* Customer care */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Customer Care
          </p>

          <div className="flex gap-4">
            <a
              href="tel:0119712745"
              className="px-6 py-3 rounded-lg bg-gray-800 text-emerald-400 hover:bg-gray-700 transition"
            >
              📞 Call Us
            </a>

            <a
              href="https://wa.me/254119712745"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              💬 WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="text-3xl font-semibold text-emerald-400 mb-6 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryItem 
              category={category} 
              key={category.name} 
              className="transform hover:scale-105 transition duration-300 ease-in-out"
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        
        {isLoading ? (
          <p className="text-center text-gray-400">Loading featured products...</p>
        ) : (
          products.length > 0 && <FeaturedProducts featuredProducts={products} />
        )}
      </section>

    </div>
  );
};

const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-800/70 text-gray-300 text-sm shadow">
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

export default HomePage;
