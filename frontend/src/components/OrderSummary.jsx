import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(
  "pk_test_51QECS1CuN2A0ZRg3Rd2xBu36onklMc2SDdezYRPo6C4Wuju4UkxQye229izbiYPtwK6t08g7WCaDzV0NZEoTMR1C00Gbcr6sIs"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, clearCart } =
    useCartStore();

  const [transactionId, setTransactionId] = useState(null);
  const [phone, setPhone] = useState("");
  const [loadingMpesa, setLoadingMpesa] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const navigate = useNavigate();
  

  const savings = subtotal - total;

  // ---------------- STRIPE ----------------
  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
      });

      const result = await stripe.redirectToCheckout({
        sessionId: res.data.id,
      });

      if (result.error) {
        toast.error("Stripe payment failed");
      }
    } catch (err) {
      toast.error("Stripe checkout failed");
    }
  };

  // ---------------- MPESA ----------------
  const handleMpesaPayment = async () => {
    if (!phone) return setMpesaMessage("Enter phone number");

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("254")) {
      formattedPhone = "0" + formattedPhone.slice(3);
    }

    if (!/^0(7|1)\d{8}$/.test(formattedPhone)) {
      return setMpesaMessage("Enter a valid Safaricom number");
    }

    setLoadingMpesa(true);
    setMpesaMessage("");
    const orderId = `LM-${Date.now()}`;

    try {
      const res = await axios.post(
        "/mpesa/stk",
        { phone: formattedPhone, amount: total,orderId,},
        { timeout: 20000 }
      );

      setTransactionId(res.data.checkoutRequestID);
      setMpesaMessage("📲 Check your phone to complete payment");
      toast.success("📲 Check your phone");
      
      const checkoutRequestID = res.data.checkoutRequestID;
      pollPaymentStatus(checkoutRequestID);

    } catch (error) {
      setMpesaMessage(
        error.response?.data?.message || "Failed to send STK push"
      );
    } finally {
      setLoadingMpesa(false);
	  
    }
  };

  // -------- POLL MPESA STATUS --------
 const pollPaymentStatus = (checkoutRequestID) => {
  const interval = setInterval(async () => {
    try {
      const res = await axios.get(
        `/mpesa/status/${checkoutRequestID}`
      );

      if (res.data.status === "SUCCESS") {
        clearInterval(interval);

        toast.success("✅ Payment successful!");
        clearCart();

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }

      if (res.data.status === "FAILED") {
        clearInterval(interval);
        toast.error("❌ Payment failed");
      }
    } catch (err) {
      console.error(err);
    }
  }, 3000); // every 3 seconds
};

  // ---------------- UI ----------------
  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Original price</span>
          <span>KES {subtotal.toLocaleString("en-KE")}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Savings</span>
            <span>-KES {savings.toLocaleString("en-KE")}</span>
          </div>
        )}

        {coupon && isCouponApplied && (
          <div className="flex justify-between text-emerald-400">
            <span>Coupon ({coupon.code})</span>
            <span>-{coupon.discountPercentage}%</span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span className="text-emerald-400">
            KES {total.toLocaleString("en-KE")}
          </span>
        </div>
      </div>

      {/* STRIPE */}
      <motion.button
        onClick={handlePayment}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-white hover:bg-emerald-700"
      >
        Pay with Card
      </motion.button>

      {/* MPESA */}
      <input
        type="tel"
        placeholder="07XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded bg-gray-900 px-4 py-2 text-white"
      />

      <motion.button
        onClick={handleMpesaPayment}
        disabled={loadingMpesa}
        className={`w-full rounded-lg py-2.5 text-white ${
          loadingMpesa
            ? "bg-gray-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {loadingMpesa ? "📲 Waiting for prompt..." : "Pay with M-PESA"}
      </motion.button>

      {mpesaMessage && (
        <p className="text-center text-sm text-emerald-400">{mpesaMessage}</p>
      )}

      <div className="flex justify-center gap-2">
        <span className="text-gray-400">or</span>
        <Link to="/" className="text-emerald-400 underline">
          Continue Shopping <MoveRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
