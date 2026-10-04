import { useEffect, useState } from "react";
import {
  Wallet,
  ReceiptText,
  Phone,
  CalendarDays,
  User,
  RefreshCw,
} from "lucide-react";

import axiosInstance from "../lib/axios";

const MpesaTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * FETCH MPESA TRANSACTIONS
   * ============================================================
   */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/mpesa/all", {
        withCredentials: true,
      });

      setTransactions(
        Array.isArray(res.data?.transactions)
          ? res.data.transactions
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch MPESA transactions:",
        error
      );

      setTransactions([]);

      setError(
        error.response?.data?.message ||
          "Failed to load MPESA transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * INITIAL FETCH
   * ============================================================
   */
  useEffect(() => {
    fetchTransactions();
  }, []);

  /*
   * ============================================================
   * FORMAT CURRENCY
   * ============================================================
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
   * ============================================================
   * STATUS BADGE
   * ============================================================
   */
  const getStatusClasses = (status) => {
    const normalizedStatus = status?.toUpperCase();

    if (
      normalizedStatus === "SUCCESS" ||
      normalizedStatus === "SUCCESSFUL" ||
      normalizedStatus === "COMPLETED"
    ) {
      return `
        bg-emerald-500/10
        text-emerald-400
        border-emerald-500/20
      `;
    }

    if (
      normalizedStatus === "FAILED" ||
      normalizedStatus === "CANCELLED"
    ) {
      return `
        bg-red-500/10
        text-red-400
        border-red-500/20
      `;
    }

    return `
      bg-yellow-500/10
      text-yellow-400
      border-yellow-500/20
    `;
  };

  return (
    <section
      className="
        w-full
        bg-gray-800
        rounded-xl
        sm:rounded-2xl
        shadow-xl
        overflow-hidden
      "
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        className="
          p-4
          sm:p-6
          border-b
          border-gray-700
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                items-center
                justify-center
                w-10
                h-10
                sm:w-12
                sm:h-12
                rounded-xl
                bg-emerald-500/10
                shrink-0
              "
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  sm:text-2xl
                  font-bold
                  text-white
                "
              >
                MPESA Transactions
              </h2>

              {!loading && (
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {transactions.length}{" "}
                  {transactions.length === 1
                    ? "transaction"
                    : "transactions"}
                </p>
              )}
            </div>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchTransactions}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              w-full
              sm:w-auto
              px-4
              py-2.5
              rounded-lg
              bg-gray-700
              hover:bg-gray-600
              text-sm
              font-medium
              text-gray-200
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ====================================================== */}
      {/* LOADING */}
      {/* ====================================================== */}

      {loading && (
        <div className="p-10 text-center">
          <RefreshCw
            className="
              w-7
              h-7
              mx-auto
              mb-3
              animate-spin
              text-emerald-400
            "
          />

          <p className="text-gray-400">
            Loading transactions...
          </p>
        </div>
      )}

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {!loading && error && (
        <div className="p-6 sm:p-10 text-center">
          <p className="text-red-400 font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchTransactions}
            className="
              mt-4
              px-4
              py-2
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-lg
              text-sm
              transition
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* ====================================================== */}
      {/* EMPTY STATE */}
      {/* ====================================================== */}

      {!loading &&
        !error &&
        transactions.length === 0 && (
          <div className="p-10 text-center">
            <Wallet
              className="
                w-12
                h-12
                mx-auto
                mb-4
                text-gray-600
              "
            />

            <h3 className="font-semibold text-gray-300">
              No MPESA transactions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Customer payments will appear here.
            </p>
          </div>
        )}

      {/* ====================================================== */}
      {/* TRANSACTIONS */}
      {/* ====================================================== */}

      {!loading &&
        !error &&
        transactions.length > 0 && (
          <>
            {/* ================================================== */}
            {/* MOBILE CARDS */}
            {/* ================================================== */}

            <div className="md:hidden divide-y divide-gray-700">
              {transactions.map((tx) => (
                <article
                  key={tx._id}
                  className="p-4"
                >
                  {/* CUSTOMER + STATUS */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                      mb-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        min-w-0
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          w-10
                          h-10
                          rounded-full
                          bg-gray-700
                          shrink-0
                        "
                      >
                        <User className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            font-semibold
                            text-white
                            truncate
                          "
                        >
                          {tx.user?.name ||
                            "Unknown customer"}
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-500
                            truncate
                            mt-1
                          "
                        >
                          {tx.user?.email ||
                            "No email available"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                        inline-flex
                        shrink-0
                        items-center
                        px-2.5
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        border
                        ${getStatusClasses(tx.status)}
                      `}
                    >
                      {tx.status || "UNKNOWN"}
                    </span>
                  </div>

                  {/* AMOUNT + PHONE */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      mb-4
                    "
                  >
                    <div
                      className="
                        bg-gray-900/60
                        rounded-lg
                        p-3
                      "
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        Amount
                      </p>

                      <p
                        className="
                          font-bold
                          text-emerald-400
                          text-sm
                          sm:text-base
                        "
                      >
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>

                    <div
                      className="
                        bg-gray-900/60
                        rounded-lg
                        p-3
                        min-w-0
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-1
                          text-gray-500
                          mb-1
                        "
                      >
                        <Phone className="w-3 h-3" />

                        <p className="text-xs">
                          Phone
                        </p>
                      </div>

                      <p
                        className="
                          text-sm
                          text-gray-200
                          truncate
                        "
                      >
                        {tx.phoneNumber || "—"}
                      </p>
                    </div>
                  </div>

                  {/* RECEIPT */}

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      py-3
                      border-t
                      border-gray-700/60
                    "
                  >
                    <ReceiptText
                      className="
                        w-4
                        h-4
                        mt-0.5
                        text-gray-500
                        shrink-0
                      "
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        MPESA Receipt
                      </p>

                      <p
                        className="
                          text-sm
                          font-mono
                          text-gray-300
                          break-all
                          mt-1
                        "
                      >
                        {tx.mpesaReceiptNumber || "—"}
                      </p>
                    </div>
                  </div>

                  {/* DATE */}

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      pt-3
                    "
                  >
                    <CalendarDays
                      className="
                        w-4
                        h-4
                        mt-0.5
                        text-gray-500
                        shrink-0
                      "
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Date
                      </p>

                      <p className="text-sm text-gray-300 mt-1">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* ================================================== */}
            {/* DESKTOP / TABLET TABLE */}
            {/* ================================================== */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className="
                    bg-gray-900/80
                    text-gray-400
                  "
                >
                  <tr>
                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Customer
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Phone
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Receipt
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Amount
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        font-medium
                      "
                    >
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700">
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="
                        hover:bg-gray-700/30
                        transition-colors
                      "
                    >
                      {/* USER */}

                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {tx.user?.name || "—"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {tx.user?.email || ""}
                        </p>
                      </td>

                      {/* PHONE */}

                      <td
                        className="
                          px-4
                          py-4
                          whitespace-nowrap
                          text-gray-300
                        "
                      >
                        {tx.phoneNumber || "—"}
                      </td>

                      {/* RECEIPT */}

                      <td
                        className="
                          px-4
                          py-4
                          whitespace-nowrap
                          font-mono
                          text-gray-300
                        "
                      >
                        {tx.mpesaReceiptNumber || "—"}
                      </td>

                      {/* AMOUNT */}

                      <td
                        className="
                          px-4
                          py-4
                          whitespace-nowrap
                          font-semibold
                          text-emerald-400
                        "
                      >
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-2.5
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            border
                            ${getStatusClasses(tx.status)}
                          `}
                        >
                          {tx.status || "UNKNOWN"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td
                        className="
                          px-4
                          py-4
                          whitespace-nowrap
                          text-gray-400
                        "
                      >
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
    </section>
  );
};

export default MpesaTransactions;