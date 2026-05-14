import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import {
  MoveRight,
  MapPin,
  ChevronDown,
  Phone,
} from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";

const deliveryLocations = [
  { name: "pick up by self", fee: 0 },
  { name: "Nairobi", fee: 300 },
  { name: "Roysambu", fee: 300 },
  { name: "Westlands", fee: 300 },
  { name: "Kasarani", fee: 300 },
  { name: "Thika Road", fee: 300 },
  { name: "Syokimau", fee: 300 },
  { name: "Kitengela", fee: 300 },
  { name: "Kilimani", fee: 300 },
  { name: "Embakasi", fee: 300 },
  { name: "Umoja", fee: 300 },
  { name: "Utawala", fee: 300 },
  { name: "Ruai", fee: 300 },
  { name: "Ruiru", fee: 350 },
  { name: "Juja", fee: 350 },
  { name: "Kahawa", fee: 300 },
  { name: "Gikambura", fee: 300 },
  { name: "Githurai", fee: 300 },
  { name: "Zambezi", fee: 300 },
  { name: "Komarock", fee: 300 },
  { name: "Korogocho", fee: 300 },
  { name: "Dandora", fee: 300 },
  { name: "Kawangware", fee: 300 },
  { name: "Mwiki", fee: 300 },
  { name: "Githogoro", fee: 300 },
  { name: "Karen", fee: 300 },
  { name: "Langata", fee: 300 },
  { name: "Lavington", fee: 300 },
  { name: "Muthaiga", fee: 300 },
  { name: "Parklands", fee: 300 },
  { name: "Pumwani", fee: 300 },
  { name: "Runda", fee: 300 },
  { name: "South B", fee: 300 },
  { name: "South C", fee: 300 },
  { name: "Kiambu", fee: 350 },
  { name: "Mombasa", fee: 500 },
  { name: "Kisumu", fee: 500 },
  { name: "Nakuru", fee: 500 },
  { name: "Eldoret", fee: 500 },
];

const OrderSummary = () => {
  const {
    total,
    subtotal,
    coupon,
    isCouponApplied,
    cart,
    clearCart,
  } = useCartStore();

  const [phone, setPhone] = useState("");
  const [deliveryLocation, setDeliveryLocation] =
    useState("");

  const [deliveryFee, setDeliveryFee] = useState(0);

  const [loadingMpesa, setLoadingMpesa] =
    useState(false);

  const [mpesaMessage, setMpesaMessage] =
    useState("");

  const navigate = useNavigate();

  // ---------- SAVINGS ----------
  const savings = subtotal - total;

  // ---------- FINAL TOTAL ----------
  const finalTotal = useMemo(() => {
    return total + deliveryFee;
  }, [total, deliveryFee]);

  // ---------- LOCATION ----------
  const handleLocationChange = (e) => {
    const selectedLocation = deliveryLocations.find(
      (loc) => loc.name === e.target.value
    );

    if (!selectedLocation) return;

    setDeliveryLocation(selectedLocation.name);
    setDeliveryFee(selectedLocation.fee);
  };

  // ---------- PAYMENT ----------
  const handleMpesaPayment = async () => {
    if (!phone) {
      return setMpesaMessage(
        "Enter M-PESA phone number"
      );
    }

    if (!deliveryLocation) {
      return setMpesaMessage(
        "Select delivery location"
      );
    }

    if (!cart.length) {
      return setMpesaMessage("Your cart is empty");
    }

    let formattedPhone = phone.trim();

    // Convert 2547... to 07...
    if (formattedPhone.startsWith("254")) {
      formattedPhone =
        "0" + formattedPhone.slice(3);
    }

    // Validate KE Safaricom numbers
    if (!/^0(7|1)\d{8}$/.test(formattedPhone)) {
      return setMpesaMessage(
        "Enter a valid Safaricom number"
      );
    }

    setLoadingMpesa(true);
    setMpesaMessage("");

    try {
      // 1️⃣ CREATE ORDER
      const orderRes = await axios.post(
        "/orders",
        {
          items: cart.map((item) => ({
            product: item._id,
            price: item.price,
            quantity: item.quantity,
          })),

          totalAmount: finalTotal,

          deliveryDetails: {
            location: deliveryLocation,
            deliveryFee,
            phoneNumber: formattedPhone,
          },
        }
      );

      const orderId = orderRes.data._id;

      if (!orderId) {
        toast.error("Order creation failed");
        return;
      }

      // 2️⃣ STK PUSH
      const stkRes = await axios.post(
        "/mpesa/stk",
        {
          phone: formattedPhone,
          amount: finalTotal,
          orderId,
        },
        {
          timeout: 20000,
        }
      );

      toast.success(
        "📲 Check your phone to complete payment"
      );

      setMpesaMessage(
        "Waiting for M-PESA confirmation..."
      );

      pollPaymentStatus(
        stkRes.data.checkoutRequestID
      );
    } catch (error) {
      console.error("MPESA ERROR:", error);

      setMpesaMessage(
        error.response?.data?.message ||
          "Failed to initiate payment"
      );
    } finally {
      setLoadingMpesa(false);
    }
  };

  // ---------- POLLING ----------
  const pollPaymentStatus = (
    checkoutRequestID
  ) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `/mpesa/status/${checkoutRequestID}`
        );

        if (res.data.status === "SUCCESS") {
          clearInterval(interval);

          toast.success(
            "✅ Payment successful!"
          );

          clearCart();

          navigate("/");
        }

        if (res.data.status === "FAILED") {
          clearInterval(interval);

          toast.error("❌ Payment failed");
        }
      } catch (error) {
        console.error(
          "Polling error:",
          error
        );
      }
    }, 3000);
  };

  // ---------- UI ----------
  return (
    <motion.div
      className="space-y-5 rounded-2xl border border-gray-700 bg-gray-800/95 p-5 shadow-2xl backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-emerald-400">
          Order Summary
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Secure checkout with M-PESA
        </p>
      </div>

      {/* PRICE SUMMARY */}
      <div className="space-y-3 rounded-xl bg-gray-900/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            Original Price
          </span>

          <span className="font-medium text-white">
            KES{" "}
            {subtotal.toLocaleString("en-KE")}
          </span>
        </div>

        {savings > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-400">
              Savings
            </span>

            <span className="font-medium text-emerald-400">
              -KES{" "}
              {savings.toLocaleString("en-KE")}
            </span>
          </div>
        )}

        {coupon && isCouponApplied && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-400">
              Coupon ({coupon.code})
            </span>

            <span className="font-medium text-emerald-400">
              -{coupon.discountPercentage}%
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            Delivery Fee
          </span>

          <span className="font-medium text-yellow-400">
            KES{" "}
            {deliveryFee.toLocaleString("en-KE")}
          </span>
        </div>

        <div className="border-t border-gray-700 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              Total
            </span>

            <span className="text-xl font-bold text-emerald-400">
              KES{" "}
              {finalTotal.toLocaleString("en-KE")}
            </span>
          </div>
        </div>
      </div>

      {/* DELIVERY LOCATION */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Delivery Location
        </label>

        <div className="relative">
          <MapPin
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <select
            value={deliveryLocation}
            onChange={handleLocationChange}
            className="h-11 w-full appearance-none rounded-xl border border-gray-700 bg-gray-900 py-2 pl-10 pr-10 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">
              Select location
            </option>

            {deliveryLocations.map((location) => (
              <option
                key={location.name}
                value={location.name}
              >
                {location.name} — KES{" "}
                {location.fee}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* PHONE */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          M-PESA Phone Number
        </label>

        <div className="relative">
          <Phone
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="tel"
            placeholder="07XXXXXXXX"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-gray-700 bg-gray-900 py-2 pl-10 pr-4 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* PAY BUTTON */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleMpesaPayment}
        disabled={loadingMpesa}
        className={`flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
          loadingMpesa
            ? "cursor-not-allowed bg-gray-600"
            : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
        }`}
      >
        {loadingMpesa
          ? "Waiting for prompt..."
          : `Pay KES ${finalTotal.toLocaleString(
              "en-KE"
            )}`}
      </motion.button>

      {/* STATUS MESSAGE */}
      {mpesaMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-center text-sm text-emerald-400">
            {mpesaMessage}
          </p>
        </div>
      )}

      {/* CONTINUE SHOPPING */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-gray-400">
          or
        </span>

        <Link
          to="/"
          className="flex items-center gap-1 font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
        >
          Continue Shopping

          <MoveRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderSummary;