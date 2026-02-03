import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";


const categories = [
  { href: "/jeans", name: "Pants", imageUrl: "/jeans.jpg" },
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
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-4">
          Welcome to Leemart Online Shop
        </h1>
        <p className="text-xl text-gray-300 mb-4">
          Your Home for Quality, Style, and Everyday Convenience.
        </p>
        <p className="text-lg text-gray-400 mb-12">
          Discover amazing products, unbeatable deals, and a smooth shopping experience crafted just for you.
        </p>
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

export default HomePage;
