import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  MoveRight,
  MapPin,
  ChevronDown,
  Phone,
  Ruler,
  Palette,
} from "lucide-react";

import axios from "../lib/axios";
import toast from "react-hot-toast";

import {
  useMemo,
  useState,
} from "react";

/*
 * ============================================================
 * DELIVERY LOCATIONS
 * ============================================================
 */

const deliveryLocations = [
  {
    name: "pick up by self",
    fee: 0,
  },

  {
    name: "Nairobi",
    fee: 300,
  },

  {
    name: "Roysambu",
    fee: 300,
  },

  {
    name: "Westlands",
    fee: 300,
  },

  {
    name: "Kasarani",
    fee: 300,
  },

  {
    name: "Thika Road",
    fee: 300,
  },

  {
    name: "Syokimau",
    fee: 300,
  },

  {
    name: "Kitengela",
    fee: 300,
  },

  {
    name: "Kilimani",
    fee: 300,
  },

  {
    name: "Embakasi",
    fee: 300,
  },

  {
    name: "Umoja",
    fee: 300,
  },

  {
    name: "Utawala",
    fee: 300,
  },

  {
    name: "Ruai",
    fee: 300,
  },

  {
    name: "Ruiru",
    fee: 350,
  },

  {
    name: "Juja",
    fee: 350,
  },

  {
    name: "Kahawa",
    fee: 300,
  },

  {
    name: "Gikambura",
    fee: 300,
  },

  {
    name: "Githurai",
    fee: 300,
  },

  {
    name: "Zambezi",
    fee: 300,
  },

  {
    name: "Komarock",
    fee: 300,
  },

  {
    name: "Korogocho",
    fee: 300,
  },

  {
    name: "Dandora",
    fee: 300,
  },

  {
    name: "Kawangware",
    fee: 300,
  },

  {
    name: "Mwiki",
    fee: 300,
  },

  {
    name: "Githogoro",
    fee: 300,
  },

  {
    name: "Karen",
    fee: 300,
  },

  {
    name: "Langata",
    fee: 300,
  },

  {
    name: "Lavington",
    fee: 300,
  },

  {
    name: "Muthaiga",
    fee: 300,
  },

  {
    name: "Parklands",
    fee: 300,
  },

  {
    name: "Pumwani",
    fee: 300,
  },

  {
    name: "Runda",
    fee: 300,
  },

  {
    name: "South B",
    fee: 300,
  },

  {
    name: "South C",
    fee: 300,
  },

  {
    name: "Kiambu",
    fee: 350,
  },

  {
    name: "Mombasa",
    fee: 500,
  },

  {
    name: "Kisumu",
    fee: 500,
  },

  {
    name: "Nakuru",
    fee: 500,
  },

  {
    name: "Eldoret",
    fee: 500,
  },
];

/*
 * ============================================================
 * ORDER SUMMARY
 * ============================================================
 */

const OrderSummary = () => {
  const {
    total,
    subtotal,
    coupon,
    isCouponApplied,
    cart,
    clearCart,
  } = useCartStore();

  const [phone, setPhone] =
    useState("");

  const [
    deliveryLocation,
    setDeliveryLocation,
  ] = useState("");

  const [
    deliveryFee,
    setDeliveryFee,
  ] = useState(0);

  const [
    loadingMpesa,
    setLoadingMpesa,
  ] = useState(false);

  const [
    mpesaMessage,
    setMpesaMessage,
  ] = useState("");

  const navigate =
    useNavigate();

  /*
   * ==========================================================
   * SAVINGS
   * ==========================================================
   */

  const savings =
    Math.max(
      Number(subtotal || 0) -
        Number(total || 0),
      0
    );

  /*
   * ==========================================================
   * FRONTEND DISPLAY TOTAL
   * ==========================================================
   *
   * Used only for displaying the expected amount.
   *
   * The backend remains authoritative.
   */

  const finalTotal =
    useMemo(() => {
      return (
        Number(total || 0) +
        Number(deliveryFee || 0)
      );
    }, [
      total,
      deliveryFee,
    ]);

  /*
   * ==========================================================
   * LOCATION
   * ==========================================================
   */

  const handleLocationChange = (
    event
  ) => {
    const selectedLocation =
      deliveryLocations.find(
        (location) =>
          location.name ===
          event.target.value
      );

    if (!selectedLocation) {
      setDeliveryLocation("");
      setDeliveryFee(0);

      return;
    }

    setDeliveryLocation(
      selectedLocation.name
    );

    setDeliveryFee(
      selectedLocation.fee
    );
  };

  /*
   * ==========================================================
   * NORMALIZE PHONE
   * ==========================================================
   */

  const normalizePhone = (
    value
  ) => {
    let formatted =
      String(value || "")
        .replace(/\s+/g, "")
        .trim();

    /*
     * +2547XXXXXXXX
     */

    if (
      formatted.startsWith(
        "+254"
      )
    ) {
      formatted =
        "0" +
        formatted.slice(4);
    }

    /*
     * 2547XXXXXXXX
     */

    if (
      formatted.startsWith(
        "254"
      )
    ) {
      formatted =
        "0" +
        formatted.slice(3);
    }

    return formatted;
  };

  /*
   * ==========================================================
   * CREATE SAFE ORDER ITEMS
   * ==========================================================
   */

  const buildOrderItems = () => {
    return cart.map(
      (item) => ({
        /*
         * Backend supports product,
         * productId or _id.
         *
         * We deliberately send product.
         */
        product: item._id,

        quantity:
          Number(
            item.quantity || 1
          ),

        /*
         * ====================================================
         * PRODUCT VARIANT
         * ====================================================
         */

        size:
          item.size || "",

        color:
          item.color || "",
      })
    );
  };

  /*
   * ==========================================================
   * M-PESA PAYMENT
   * ==========================================================
   */

const handleMpesaPayment = async () => {
  /*
   * Prevent accidental double submission.
   */
  if (loadingMpesa) {
    return;
  }

  /*
   * ==========================================================
   * PHONE
   * ==========================================================
   */

  if (!phone.trim()) {
    setMpesaMessage(
      "Enter M-PESA phone number"
    );

    return;
  }

  /*
   * ==========================================================
   * DELIVERY LOCATION
   * ==========================================================
   */

  if (!deliveryLocation) {
    setMpesaMessage(
      "Select delivery location"
    );

    return;
  }

  /*
   * ==========================================================
   * CART
   * ==========================================================
   */

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    setMpesaMessage(
      "Your cart is empty"
    );

    return;
  }

  /*
   * ==========================================================
   * NORMALIZE PHONE
   * ==========================================================
   */

  const formattedPhone =
    normalizePhone(phone);

  /*
   * Kenyan mobile:
   *
   * 07XXXXXXXX
   * 01XXXXXXXX
   */

  if (
    !/^0(7|1)\d{8}$/.test(
      formattedPhone
    )
  ) {
    setMpesaMessage(
      "Enter a valid Safaricom number"
    );

    return;
  }

  setLoadingMpesa(true);
  setMpesaMessage("");

  try {
    /*
     * ========================================================
     * STEP 1 — BUILD ORDER ITEMS
     * ========================================================
     */

    const orderItems =
      buildOrderItems();

    /*
     * ========================================================
     * STEP 2 — CREATE ORDER
     * ========================================================
     *
     * We deliberately do NOT send:
     *
     * - product prices
     * - subtotal
     * - discount amount
     * - delivery fee
     * - final total
     *
     * Backend calculates all monetary values.
     */

    const orderRes =
      await axios.post(
        "/orders",
        {
          items: orderItems,

          /*
           * Send only coupon code.
           *
           * Backend verifies ownership,
           * validity and discount.
           */
          couponCode:
            isCouponApplied &&
            coupon?.code
              ? coupon.code
              : null,

          deliveryDetails: {
            location:
              deliveryLocation,

            phoneNumber:
              formattedPhone,
          },
        },
        {
          withCredentials: true,

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    /*
     * ========================================================
     * CREATED ORDER
     * ========================================================
     */

    const createdOrder =
      orderRes.data?.order ||
      orderRes.data;

    if (!createdOrder) {
      console.error(
        "INVALID ORDER RESPONSE:",
        orderRes.data
      );

      throw new Error(
        "Order was not returned by the server"
      );
    }

    /*
     * ========================================================
     * ORDER ID
     * ========================================================
     */

    const orderId =
      createdOrder?._id;

    if (!orderId) {
      console.error(
        "ORDER RESPONSE WITHOUT ID:",
        orderRes.data
      );

      throw new Error(
        "Order ID was not returned by the server"
      );
    }

    /*
     * ========================================================
     * SERVER-CALCULATED TOTAL
     * ========================================================
     */

    const serverTotal =
      Number(
        createdOrder.totalAmount
      );

    if (
      !Number.isFinite(
        serverTotal
      ) ||
      serverTotal <= 0
    ) {
      console.error(
        "INVALID SERVER TOTAL:",
        createdOrder
      );

      throw new Error(
        "Invalid order total returned by server"
      );
    }

    /*
     * Helpful development logs.
     */

    console.log(
      "CREATED ORDER:",
      createdOrder
    );

    console.log(
      "ORDER ID:",
      orderId
    );

    console.log(
      "SERVER TOTAL:",
      serverTotal
    );

    console.log(
      "M-PESA PHONE:",
      formattedPhone
    );

    /*
     * ========================================================
     * STEP 3 — START M-PESA STK PUSH
     * ========================================================
     *
     * IMPORTANT:
     *
     * Backend requires:
     *
     * {
     *   phone,
     *   orderId
     * }
     *
     * Do NOT send amount.
     *
     * Backend loads MpesaOrder and gets
     * totalAmount from MongoDB.
     */

    const stkRes =
      await axios.post(
        "/mpesa/stk",
        {
          phone:
            formattedPhone,

          orderId,
        },
        {
          withCredentials: true,

          timeout: 20000,

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      "STK RESPONSE:",
      stkRes.data
    );

    /*
     * ========================================================
     * CHECKOUT REQUEST ID
     * ========================================================
     */

    const checkoutRequestID =
      stkRes.data
        ?.checkoutRequestID;

    if (!checkoutRequestID) {
      console.error(
        "INVALID STK RESPONSE:",
        stkRes.data
      );

      throw new Error(
        stkRes.data?.message ||
          "M-PESA did not return a checkout request ID"
      );
    }

    /*
     * ========================================================
     * STK STARTED
     * ========================================================
     */

    toast.success(
      "Check your phone to complete payment"
    );

    setMpesaMessage(
      `M-PESA request sent. Confirm KES ${serverTotal.toLocaleString(
        "en-KE"
      )} on your phone.`
    );

    /*
     * ========================================================
     * STEP 4 — POLL PAYMENT STATUS
     * ========================================================
     */

    pollPaymentStatus(
      checkoutRequestID
    );
  } catch (error) {
    /*
     * ========================================================
     * DETAILED ERROR LOGGING
     * ========================================================
     */

    console.error(
      "========== M-PESA CHECKOUT ERROR =========="
    );

    console.error(
      "Full error:",
      error
    );

    console.error(
      "Status:",
      error?.response?.status
    );

    console.error(
      "Backend response:",
      error?.response?.data
    );

    console.error(
      "Backend message:",
      error?.response?.data
        ?.message
    );

    console.error(
      "Request URL:",
      error?.config?.url
    );

    console.error(
      "Request method:",
      error?.config?.method
    );

    console.error(
      "Request data:",
      error?.config?.data
    );

    console.error(
      "Axios message:",
      error?.message
    );

    console.error(
      "=========================================="
    );

    /*
     * ========================================================
     * USER-FRIENDLY MESSAGE
     * ========================================================
     */

    let message =
      error?.response?.data
        ?.message ||
      error?.response?.data
        ?.error ||
      error?.message ||
      "Failed to initiate payment";

    /*
     * Axios timeout.
     *
     * Do NOT tell customer payment failed,
     * because Safaricom may still have
     * received the STK request.
     */
    if (
      error?.code ===
      "ECONNABORTED"
    ) {
      message =
        "M-PESA is taking longer than expected. Check your phone before trying again.";
    }

    /*
     * Duplicate pending transaction.
     */
    if (
      error?.response?.status ===
      409
    ) {
      message =
        error?.response?.data
          ?.message ||
        "An M-PESA request is already pending for this order. Check your phone.";
    }

    setMpesaMessage(
      message
    );

    toast.error(
      message
    );
  } finally {
    setLoadingMpesa(false);
  }
};

  

  const pollPaymentStatus = (
    checkoutRequestID
  ) => {
    let attempts = 0;

    /*
     * 3 seconds × 40 attempts
     * = approximately 2 minutes.
     */

    const maxAttempts = 40;

    const interval =
      setInterval(
        async () => {
          attempts += 1;

          try {
            const response =
              await axios.get(
                `/mpesa/status/${checkoutRequestID}`,
                {
                  withCredentials:
                    true,
                }
              );

            /*
             * =================================================
             * SUCCESS
             * =================================================
             */

            if (
              response.data
                ?.status ===
              "SUCCESS"
            ) {
              clearInterval(
                interval
              );

              toast.success(
                "Payment successful!"
              );

              setMpesaMessage(
                "Payment confirmed. Thank you!"
              );

              /*
               * clearCart now clears
               * the backend cart too.
               */

              try {
                await clearCart();
              } catch (
                clearError
              ) {
                console.error(
                  "CLEAR CART ERROR:",
                  clearError
                );
              }

              navigate("/");

              return;
            }

            /*
             * =================================================
             * FAILURE
             * =================================================
             */

            if (
              response.data
                ?.status ===
              "FAILED"
            ) {
              clearInterval(
                interval
              );

              setMpesaMessage(
                "Payment failed. Please try again."
              );

              toast.error(
                "Payment failed"
              );

              return;
            }

            /*
             * =================================================
             * TIMEOUT
             * =================================================
             */

            if (
              attempts >=
              maxAttempts
            ) {
              clearInterval(
                interval
              );

              setMpesaMessage(
                "Payment confirmation is taking longer than expected. Please check your M-PESA messages before trying again."
              );
            }
          } catch (error) {
            console.error(
              "Polling error:",
              error.response
                ?.data ||
                error.message
            );

            /*
             * Don't immediately stop.
             *
             * A temporary network error
             * shouldn't mark a real payment
             * as failed.
             */

            if (
              attempts >=
              maxAttempts
            ) {
              clearInterval(
                interval
              );

              setMpesaMessage(
                "Unable to confirm payment status. Please check your M-PESA messages."
              );
            }
          }
        },
        3000
      );
  };

  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <motion.div
      className="
        space-y-5
        rounded-2xl
        border
        border-gray-700
        bg-gray-800/95
        p-4
        shadow-2xl
        backdrop-blur-sm
        sm:p-6
      "
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h2
          className="
            text-xl
            font-bold
            text-emerald-400
            sm:text-2xl
          "
        >
          Order Summary
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-gray-400
          "
        >
          Secure checkout with
          M-PESA
        </p>
      </div>

      {/* ==================================================
          SELECTED ITEMS / VARIANTS
      ================================================== */}

      {cart.length > 0 && (
        <div
          className="
            space-y-3
            rounded-xl
            border
            border-gray-700
            bg-gray-900/40
            p-3
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            Your items
          </p>

          {cart.map(
            (item) => {
              const variantKey = `${
                item._id
              }-${
                item.size ||
                "no-size"
              }-${
                item.color ||
                "no-color"
              }`;

              return (
                <div
                  key={
                    item.cartItemId ||
                    variantKey
                  }
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                    border-b
                    border-gray-800
                    pb-3
                    last:border-b-0
                    last:pb-0
                  "
                >
                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-white
                      "
                    >
                      {item.name}
                    </p>

                    <div
                      className="
                        mt-1
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {item.size && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-md
                            bg-gray-800
                            px-2
                            py-1
                            text-xs
                            text-gray-300
                          "
                        >
                          <Ruler
                            size={12}
                          />

                          Size{" "}
                          {
                            item.size
                          }
                        </span>
                      )}

                      {item.color && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-md
                            bg-gray-800
                            px-2
                            py-1
                            text-xs
                            text-gray-300
                          "
                        >
                          <Palette
                            size={12}
                          />

                          {
                            item.color
                          }
                        </span>
                      )}

                      <span
                        className="
                          rounded-md
                          bg-gray-800
                          px-2
                          py-1
                          text-xs
                          text-gray-300
                        "
                      >
                        Qty{" "}
                        {item.quantity}
                      </span>
                    </div>
                  </div>

                  <span
                    className="
                      whitespace-nowrap
                      text-sm
                      font-semibold
                      text-gray-200
                    "
                  >
                    KES{" "}
                    {(
                      Number(
                        item.price
                      ) *
                      Number(
                        item.quantity
                      )
                    ).toLocaleString(
                      "en-KE"
                    )}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ==================================================
          PRICE SUMMARY
      ================================================== */}

      <div
        className="
          space-y-3
          rounded-xl
          bg-gray-900/60
          p-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            text-sm
          "
        >
          <span className="text-gray-300">
            Original Price
          </span>

          <span
            className="
              font-medium
              text-white
            "
          >
            KES{" "}
            {Number(
              subtotal || 0
            ).toLocaleString(
              "en-KE"
            )}
          </span>
        </div>

        {savings > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              text-sm
            "
          >
            <span className="text-emerald-400">
              Savings
            </span>

            <span
              className="
                font-medium
                text-emerald-400
              "
            >
              -KES{" "}
              {savings.toLocaleString(
                "en-KE"
              )}
            </span>
          </div>
        )}

        {coupon &&
          isCouponApplied && (
            <div
              className="
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-emerald-400">
                Coupon (
                {coupon.code})
              </span>

              <span
                className="
                  font-medium
                  text-emerald-400
                "
              >
                -
                {
                  coupon.discountPercentage
                }
                %
              </span>
            </div>
          )}

        <div
          className="
            flex
            items-center
            justify-between
            text-sm
          "
        >
          <span className="text-gray-300">
            Delivery Fee
          </span>

          <span
            className="
              font-medium
              text-yellow-400
            "
          >
            KES{" "}
            {Number(
              deliveryFee
            ).toLocaleString(
              "en-KE"
            )}
          </span>
        </div>

        <div
          className="
            border-t
            border-gray-700
            pt-3
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-lg
                font-bold
                text-white
              "
            >
              Total
            </span>

            <span
              className="
                text-xl
                font-bold
                text-emerald-400
              "
            >
              KES{" "}
              {finalTotal.toLocaleString(
                "en-KE"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          DELIVERY LOCATION
      ================================================== */}

      <div>
        <label
          className="
            mb-2
            block
            text-sm
            font-medium
            text-gray-300
          "
        >
          Delivery Location
        </label>

        <div className="relative">
          <MapPin
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <select
            value={
              deliveryLocation
            }
            onChange={
              handleLocationChange
            }
            disabled={
              loadingMpesa
            }
            className="
              h-12
              w-full
              appearance-none
              rounded-xl
              border
              border-gray-700
              bg-gray-900
              py-2
              pl-10
              pr-10
              text-sm
              text-white
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/30
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <option value="">
              Select location
            </option>

            {deliveryLocations.map(
              (location) => (
                <option
                  key={
                    location.name
                  }
                  value={
                    location.name
                  }
                >
                  {
                    location.name
                  }{" "}
                  — KES{" "}
                  {
                    location.fee
                  }
                </option>
              )
            )}
          </select>

          <ChevronDown
            size={18}
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />
        </div>
      </div>

      {/* ==================================================
          PHONE
      ================================================== */}

      <div>
        <label
          className="
            mb-2
            block
            text-sm
            font-medium
            text-gray-300
          "
        >
          M-PESA Phone Number
        </label>

        <div className="relative">
          <Phone
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07XXXXXXXX"
            value={phone}
            disabled={
              loadingMpesa
            }
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            className="
              h-12
              w-full
              rounded-xl
              border
              border-gray-700
              bg-gray-900
              py-2
              pl-10
              pr-4
              text-sm
              text-white
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-500/30
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />
        </div>
      </div>

      {/* ==================================================
          PAY BUTTON
      ================================================== */}

      <motion.button
        whileTap={{
          scale: 0.98,
        }}
        onClick={
          handleMpesaPayment
        }
        disabled={
          loadingMpesa ||
          cart.length === 0
        }
        className={`
          flex
          h-12
          w-full
          items-center
          justify-center
          rounded-xl
          text-sm
          font-semibold
          text-white
          transition-all
          duration-200
          ${
            loadingMpesa ||
            cart.length === 0
              ? "cursor-not-allowed bg-gray-600"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
          }
        `}
      >
        {loadingMpesa
          ? "Starting payment..."
          : `Pay KES ${finalTotal.toLocaleString(
              "en-KE"
            )}`}
      </motion.button>

      {/* ==================================================
          STATUS MESSAGE
      ================================================== */}

      {mpesaMessage && (
        <div
          className="
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            p-3
          "
        >
          <p
            className="
              text-center
              text-sm
              text-emerald-400
            "
          >
            {mpesaMessage}
          </p>
        </div>
      )}

      {/* ==================================================
          CONTINUE SHOPPING
      ================================================== */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-2
          text-sm
        "
      >
        <span className="text-gray-400">
          or
        </span>

        <Link
          to="/"
          className="
            flex
            items-center
            gap-1
            font-medium
            text-emerald-400
            transition
            hover:text-emerald-300
            hover:underline
          "
        >
          Continue Shopping

          <MoveRight
            size={16}
          />
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderSummary;