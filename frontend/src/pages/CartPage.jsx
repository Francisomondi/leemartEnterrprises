import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import { useCartStore } from "../stores/useCartStore";

import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

/*
 * ============================================================
 * KES FORMATTER
 * ============================================================
 */

export const formatKES = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "KES 0";
  }

  return `KES ${value.toLocaleString("en-KE")}`;
};

/*
 * ============================================================
 * CART VARIANT KEY
 * ============================================================
 *
 * Different sizes/colors of the same product must have
 * different React keys.
 */

const getCartItemKey = (item) => {
  const productId =
    item._id ||
    item.productId ||
    "";

  const size =
    item.size || "no-size";

  const color =
    item.color || "no-color";

  return `${productId}-${size}-${color}`;
};

/*
 * ============================================================
 * CART PAGE
 * ============================================================
 */

const CartPage = () => {
  const cart = useCartStore(
    (state) => state.cart || []
  );

  const hasItems =
    cart.length > 0;

  return (
    <main className="min-h-[70vh] py-8 md:py-16">
      <div
        className="
          mx-auto
          max-w-screen-xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mt-6
            sm:mt-8
            lg:flex
            lg:items-start
            lg:gap-6
            xl:gap-8
          "
        >
          {/* CART ITEMS */}

          <motion.section
            className="
              mx-auto
              w-full
              flex-none
              lg:max-w-2xl
              xl:max-w-4xl
            "
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            {!hasItems ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {cart.map((item) => (
                  <CartItem
                    key={getCartItemKey(item)}
                    item={item}
                    formatKES={formatKES}
                  />
                ))}
              </div>
            )}

            {hasItems && (
              <PeopleAlsoBought />
            )}
          </motion.section>

          {/* ORDER SUMMARY */}

          {hasItems && (
            <motion.aside
              className="
                mx-auto
                mt-8
                w-full
                max-w-4xl
                flex-1
                space-y-6
                lg:mt-0
              "
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            >
              <OrderSummary />

              <GiftCouponCard />
            </motion.aside>
          )}
        </div>
      </div>
    </main>
  );
};

export default CartPage;

/*
 * ============================================================
 * EMPTY CART
 * ============================================================
 */

const EmptyCartUI = () => (
  <motion.div
    className="
      flex
      flex-col
      items-center
      justify-center
      space-y-4
      py-16
      px-4
      text-center
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
      duration: 0.4,
    }}
  >
    <div
      className="
        w-24
        h-24
        rounded-full
        bg-gray-800
        flex
        items-center
        justify-center
      "
    >
      <ShoppingCart
        className="
          h-12
          w-12
          text-gray-400
        "
      />
    </div>

    <h3 className="text-2xl font-semibold text-white">
      Your cart is empty
    </h3>

    <p className="max-w-md text-gray-400">
      Looks like you haven&apos;t
      added anything to your cart yet.
    </p>

    <Link
      to="/"
      className="
        mt-4
        min-h-[46px]
        inline-flex
        items-center
        justify-center
        rounded-lg
        bg-emerald-600
        px-6
        py-2
        font-medium
        text-white
        transition
        hover:bg-emerald-700
      "
    >
      Start Shopping
    </Link>
  </motion.div>
);