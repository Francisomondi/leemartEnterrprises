import { useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  Phone,
  CheckCircle,
  Loader,
} from "lucide-react";

import toast from "react-hot-toast";

import { useUserStore } from "../stores/useUserStore";

const CompleteProfilePage = () => {
  const navigate = useNavigate();

  const {
    user,
    updateProfile,
    loading,
  } = useUserStore();

  const [phone, setPhone] = useState("");

  /*
   * ==========================================
   * AUTH PROTECTION
   * ==========================================
   *
   * Only authenticated users should access
   * this page.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * ==========================================
   * PROFILE ALREADY COMPLETE
   * ==========================================
   *
   * Prevent users who already have a phone
   * number from returning to this page.
   */
  if (user.phone) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * ==========================================
   * SUBMIT PHONE NUMBER
   * ==========================================
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let formattedPhone =
      phone.trim();

    /*
     * Accept:
     *
     * 0712345678
     * 0112345678
     */
    if (
      /^0(7|1)\d{8}$/.test(
        formattedPhone
      )
    ) {
      formattedPhone =
        "254" +
        formattedPhone.slice(1);
    }

    /*
     * Also accept:
     *
     * 712345678
     * 112345678
     */
    else if (
      /^(7|1)\d{8}$/.test(
        formattedPhone
      )
    ) {
      formattedPhone =
        "254" + formattedPhone;
    }

    /*
     * Final accepted format:
     *
     * 254712345678
     * 254112345678
     */
    if (
      !/^254(7|1)\d{8}$/.test(
        formattedPhone
      )
    ) {
      toast.error(
        "Enter a valid Safaricom phone number"
      );

      return;
    }

    try {
      await updateProfile({
        phone: formattedPhone,
      });

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Profile completion failed:",
        error
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">

      <motion.div
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
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8">

          {/* ============================= */}
          {/* GOOGLE PROFILE */}
          {/* ============================= */}

          {user.avatar && (
            <div className="flex justify-center mb-5">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
              />
            </div>
          )}

          {/* ============================= */}
          {/* HEADER */}
          {/* ============================= */}

          <div className="text-center mb-8">

            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400">
              Complete Your Profile
            </h1>

            <p className="text-gray-300 mt-3">
              Welcome,{" "}
              <span className="font-semibold">
                {user.name}
              </span>
            </p>

            <p className="text-gray-400 text-sm mt-2">
              Add your phone number to complete
              your Leemart account.
            </p>

          </div>

          {/* ============================= */}
          {/* FORM */}
          {/* ============================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>

              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Safaricom Phone Number
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="07XXXXXXXX"
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Your number will be saved as
                254XXXXXXXXX and can be used
                during M-PESA checkout.
              </p>

            </div>

            {/* ============================= */}
            {/* SUBMIT */}
            {/* ============================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >

              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Profile
                </>
              )}

            </button>

          </form>

          {/* ============================= */}
          {/* INFO */}
          {/* ============================= */}

          <div className="mt-6 border-t border-gray-700 pt-5">

            <p className="text-xs text-center text-gray-500">
              Google does not provide your phone
              number to Leemart. Your number is
              added securely to your Leemart
              account.
            </p>

          </div>

        </div>
      </motion.div>

    </div>
  );
};

export default CompleteProfilePage;