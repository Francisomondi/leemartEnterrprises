import { useEffect } from "react";
import { Link } from "react-router-dom";

import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import { useProductStore } from "../stores/useProductStore";

const categories = [
  {
    href: "/pants",
    name: "Pants",
    imageUrl: "/jeans.jpg",
  },
  {
    href: "/t-shirts",
    name: "Shirts",
    imageUrl: "/tshirts.jpg",
  },
  {
    href: "/shoes",
    name: "Shoes",
    imageUrl: "/shoes.jpg",
  },
  {
    href: "/sandals",
    name: "Sandals",
    imageUrl: "/sandal2.jpg",
  },
  {
    href: "/jackets",
    name: "Jackets",
    imageUrl: "/jackets.jpg",
  },
  {
    href: "/suits",
    name: "Suits",
    imageUrl: "/suits.jpg",
  },
  {
    href: "/bags",
    name: "Bags",
    imageUrl: "/bags.jpg",
  },
  {
    href: "/dresses",
    name: "Dresses",
    imageUrl: "/dresses.jpg",
  },
  {
    href: "/twopiece",
    name: "Two Piece",
    imageUrl: "/twopiece.jpg",
  },
  {
    href: "/hoodies",
    name: "Hoodies",
    imageUrl: "/hoodies.jpg",
  },
  {
    href: "/shorts",
    name: "Shorts",
    imageUrl: "/shorts.jpg",
  },
  {
    href: "/hats",
    name: "Hats",
    imageUrl: "/hats.jpeg",
  },
];

const HomePage = () => {
  const {
    fetchFeaturedProducts,
    products,
    isLoading,
  } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const featuredProducts =
    Array.isArray(products)
      ? products
      : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <section
        className="
          relative
          h-[250px]
          w-full
          bg-contain
          bg-center
          bg-no-repeat
          sm:h-[400px]
          md:h-[520px]
          lg:h-[620px]
          xl:h-[720px]
        "
        style={{
          backgroundImage:
            "url('/banner.png')",
        }}
      >
        {/* Dark overlay */}

        <div className="absolute inset-0 bg-black/40" />

        {/* Emerald overlay */}

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-black/10 to-transparent" />

        {/* Hero actions */}

        <div className="relative z-10 flex h-full w-full items-end justify-center px-4 pb-5 sm:items-center sm:pb-0">
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
            <Link
              to="/products"
              className="
                inline-flex
                min-h-[42px]
                items-center
                justify-center
                rounded-full
                bg-emerald-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                transition
                hover:bg-emerald-700
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-400
                focus:ring-offset-2
                focus:ring-offset-gray-900
                sm:px-6
                sm:text-base
              "
            >
              Shop Now
            </Link>

            <a
              href="https://wa.me/254119712745"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                min-h-[42px]
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-white/10
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/20
                focus:outline-none
                focus:ring-2
                focus:ring-white/50
                sm:px-6
                sm:text-base
              "
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* CATEGORIES */}
      {/* ================================================== */}

      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 text-center sm:mb-7">
          <h2 className="text-2xl font-bold text-emerald-400 sm:text-3xl">
            Shop by Category
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400 sm:text-base">
            Find the style you're looking
            for
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-4
            md:grid-cols-4
            lg:grid-cols-6
          "
        >
          {categories.map(
            (category) => (
              <CategoryItem
                key={category.href}
                category={category}
              />
            )
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* FEATURED PRODUCTS */}
      {/* ================================================== */}

      <section className="mx-auto w-full max-w-7xl px-3 pb-12 pt-3 sm:px-6 sm:pb-16 lg:px-8">
        {isLoading ? (
          <FeaturedProductsSkeleton />
        ) : featuredProducts.length >
          0 ? (
          <FeaturedProducts
            featuredProducts={
              featuredProducts
            }
          />
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-800/40 px-4 py-10 text-center">
            <p className="font-medium text-gray-300">
              No featured products yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Check back soon for new
              arrivals.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

/*
 * ============================================================
 * FEATURED PRODUCTS LOADING SKELETON
 * ============================================================
 */

const FeaturedProductsSkeleton = () => {
  return (
    <div>
      <div className="mx-auto mb-6 h-7 w-48 animate-pulse rounded-lg bg-gray-800" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/50"
          >
            <div className="aspect-[4/5] animate-pulse bg-gray-800" />

            <div className="space-y-3 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700" />

              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;