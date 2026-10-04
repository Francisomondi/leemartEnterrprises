import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";

/*
 * ============================================================
 * CATEGORY LABELS
 * ============================================================
 *
 * URL/database value -> customer-facing label
 */

const CATEGORY_LABELS = {
  pants: "Pants",
  "t-shirts": "T-Shirts",
  shoes: "Shoes",
  sandals: "Sandals",
  jackets: "Jackets",
  suits: "Suits",
  bags: "Bags",
  dresses: "Dresses",
  twopiece: "Two Piece",
  hoodies: "Hoodies",
  shorts: "Shorts",
  hats: "Hats",
};

/*
 * ============================================================
 * NORMALIZE CATEGORY
 * ============================================================
 */

const normalizeCategory = (value = "") => {
  const raw = decodeURIComponent(
    String(value)
  )
    .trim()
    .toLowerCase();

  /*
   * Support older links if they still exist
   * somewhere in the application.
   */

  const aliases = {
    "two piece": "twopiece",
    "two-piece": "twopiece",

    tshirt: "t-shirts",
    tshirts: "t-shirts",
    "t-shirt": "t-shirts",

    pant: "pants",
    shoe: "shoes",
    sandal: "sandals",
    jacket: "jackets",
    suit: "suits",
    bag: "bags",
    dress: "dresses",
    hoodie: "hoodies",
    short: "shorts",
    hat: "hats",
  };

  return aliases[raw] || raw;
};

/*
 * ============================================================
 * CATEGORY PAGE
 * ============================================================
 */

const CategoryPage = () => {
  const { category } = useParams();

  /*
   * Subscribe to only what this page needs.
   */

  const products = useProductStore(
    (state) => state.products
  );

  const fetchProductsByCategory =
    useProductStore(
      (state) =>
        state.fetchProductsByCategory
    );

	const loading = useProductStore(
	(state) => state.loading
	);

  /*
   * ==========================================================
   * NORMALIZED CATEGORY
   * ==========================================================
   */

  const normalizedCategory =
    normalizeCategory(category);

  const categoryLabel =
    CATEGORY_LABELS[
      normalizedCategory
    ] ||
    normalizedCategory
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  /*
   * ==========================================================
   * FETCH PRODUCTS
   * ==========================================================
   */

  useEffect(() => {
    if (!normalizedCategory) {
      return;
    }

    fetchProductsByCategory(
      normalizedCategory
    );
  }, [
    fetchProductsByCategory,
    normalizedCategory,
  ]);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <main className="min-h-screen">
      <div
        className="
          relative
          z-10
          mx-auto
          max-w-screen-xl
          px-4
          py-16
          sm:px-6
          lg:px-8
          lg:py-20
        "
      >
        {/* ==================================================
            CATEGORY TITLE
        ================================================== */}

        <motion.div
          className="
            mb-8
            text-center
            sm:mb-10
          "
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <h1
            className="
              text-3xl
              font-bold
              text-emerald-400
              sm:text-4xl
              lg:text-5xl
            "
          >
            {categoryLabel}
          </h1>

          {!loading &&
            products.length > 0 && (
              <p
                className="
                  mt-3
                  text-sm
                  text-gray-400
                  sm:text-base
                "
              >
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}{" "}
                available
              </p>
            )}
        </motion.div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div
            className="
              grid
              grid-cols-2
              gap-4
              sm:gap-6
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <ProductSkeleton
                key={index}
              />
            ))}
          </div>
        )}

        {/* ==================================================
            EMPTY CATEGORY
        ================================================== */}

        {!loading &&
          products.length === 0 && (
            <motion.div
              className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-gray-800
                bg-gray-900/30
                px-4
                text-center
              "
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-200
                  sm:text-2xl
                "
              >
                No products found
              </h2>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  text-gray-400
                  sm:text-base
                "
              >
                There are currently no{" "}
                {categoryLabel.toLowerCase()}{" "}
                available.
              </p>
            </motion.div>
          )}

        {/* ==================================================
            PRODUCTS
        ================================================== */}

        {!loading &&
          products.length > 0 && (
            <motion.div
              className="
                grid
                grid-cols-2
                gap-4
                sm:gap-6
                lg:grid-cols-3
                xl:grid-cols-4
              "
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
            >
              {products.map(
                (product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                )
              )}
            </motion.div>
          )}
      </div>
    </main>
  );
};

export default CategoryPage;

/*
 * ============================================================
 * PRODUCT LOADING SKELETON
 * ============================================================
 */

const ProductSkeleton = () => {
  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-800
        bg-gray-800
        animate-pulse
      "
    >
      <div
        className="
          aspect-square
          w-full
          bg-gray-700
        "
      />

      <div className="space-y-3 p-4">
        <div
          className="
            h-4
            w-3/4
            rounded
            bg-gray-700
          "
        />

        <div
          className="
            h-4
            w-1/2
            rounded
            bg-gray-700
          "
        />

        <div
          className="
            h-5
            w-1/3
            rounded
            bg-gray-700
          "
        />
      </div>
    </div>
  );
};