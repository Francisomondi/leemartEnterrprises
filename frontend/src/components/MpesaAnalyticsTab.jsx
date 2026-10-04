import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  XCircle,
  Clock,
  CalendarDays,
  ReceiptText,
  Activity,
} from "lucide-react";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toUpperCase();
};

const isToday = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
  );
};

/*
 * ============================================================
 * ANALYTICS CARD
 * ============================================================
 */

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = "text-emerald-400",
  iconBackground = "bg-emerald-500/10",
  delay = 0,
}) => {
  return (
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
        delay,
      }}
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-700/70
        bg-gray-800
        p-4
        sm:p-5
        lg:p-6
        shadow-lg
      "
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              ${iconBackground}
            `}
          >
            <Icon
              className={`h-5 w-5 ${iconClassName}`}
            />
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 sm:text-sm">
          {title}
        </p>

        <p className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">
          {value}
        </p>

        {subtitle && (
          <p className="mt-2 text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <Icon
        className={`
          absolute
          -bottom-5
          -right-5
          h-28
          w-28
          opacity-[0.04]
          sm:h-32
          sm:w-32
          ${iconClassName}
        `}
      />
    </motion.div>
  );
};

/*
 * ============================================================
 * MPESA ANALYTICS
 * ============================================================
 */

const MpesaAnalyticsTab = ({
  transactions = [],
}) => {
  /*
   * ==========================================================
   * SAFE TRANSACTIONS
   * ==========================================================
   */

  const safeTransactions =
    Array.isArray(transactions)
      ? transactions
      : [];

  /*
   * ==========================================================
   * PAYMENT STATUS GROUPS
   * ==========================================================
   */

  const successful =
    safeTransactions.filter(
      (tx) =>
        normalizeStatus(tx.status) ===
        "SUCCESS"
    );

  const failed =
    safeTransactions.filter(
      (tx) =>
        normalizeStatus(tx.status) ===
        "FAILED"
    );

  const pending =
    safeTransactions.filter(
      (tx) =>
        normalizeStatus(tx.status) ===
        "PENDING"
    );

  /*
   * REVIEW is important because your M-PESA backend can put
   * suspicious payments into REVIEW rather than incorrectly
   * marking them successful.
   */
  const review =
    safeTransactions.filter(
      (tx) =>
        normalizeStatus(tx.status) ===
        "REVIEW"
    );

  /*
   * ==========================================================
   * TOTAL REVENUE
   * ==========================================================
   *
   * Revenue comes ONLY from transactions confirmed SUCCESS.
   */

  const totalRevenue =
    successful.reduce(
      (sum, tx) =>
        sum +
        Number(tx.amount || 0),
      0
    );

  /*
   * ==========================================================
   * TODAY'S SUCCESSFUL TRANSACTIONS
   * ==========================================================
   */

  const successfulToday =
    successful.filter((tx) =>
      isToday(
        tx.updatedAt ||
          tx.createdAt
      )
    );

  const todayRevenue =
    successfulToday.reduce(
      (sum, tx) =>
        sum +
        Number(tx.amount || 0),
      0
    );

  /*
   * ==========================================================
   * SUCCESS RATE
   * ==========================================================
   *
   * Pending and review transactions aren't considered final.
   */

  const completedTransactions =
    successful.length +
    failed.length;

  const successRate =
    completedTransactions > 0
      ? (successful.length /
          completedTransactions) *
        100
      : 0;

  /*
   * ==========================================================
   * AVERAGE SUCCESSFUL PAYMENT
   * ==========================================================
   */

  const averageTransaction =
    successful.length > 0
      ? totalRevenue /
        successful.length
      : 0;

  /*
   * ==========================================================
   * EMPTY STATE
   * ==========================================================
   */

  if (
    safeTransactions.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center sm:p-12">
        <Wallet className="mx-auto h-12 w-12 text-gray-600" />

        <h3 className="mt-4 text-lg font-semibold text-white">
          No M-PESA analytics yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Payment analytics will
          appear here after customers
          begin making M-PESA
          transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ================================================== */}
      {/* MAIN PAYMENT METRICS */}
      {/* ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          xl:grid-cols-4
        "
      >
        <AnalyticsCard
          title="M-PESA Revenue"
          value={formatCurrency(
            totalRevenue
          )}
          subtitle="Confirmed successful payments"
          icon={Wallet}
          iconClassName="text-emerald-400"
          iconBackground="bg-emerald-500/10"
          delay={0}
        />

        <AnalyticsCard
          title="Successful"
          value={successful.length.toLocaleString(
            "en-KE"
          )}
          subtitle="Completed M-PESA payments"
          icon={TrendingUp}
          iconClassName="text-green-400"
          iconBackground="bg-green-500/10"
          delay={0.05}
        />

        <AnalyticsCard
          title="Failed"
          value={failed.length.toLocaleString(
            "en-KE"
          )}
          subtitle="Failed or cancelled payments"
          icon={XCircle}
          iconClassName="text-red-400"
          iconBackground="bg-red-500/10"
          delay={0.1}
        />

        <AnalyticsCard
          title="Pending"
          value={pending.length.toLocaleString(
            "en-KE"
          )}
          subtitle="Awaiting payment confirmation"
          icon={Clock}
          iconClassName="text-yellow-400"
          iconBackground="bg-yellow-500/10"
          delay={0.15}
        />
      </div>

      {/* ================================================== */}
      {/* TODAY */}
      {/* ================================================== */}

      <motion.section
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
          delay: 0.2,
        }}
        className="
          overflow-hidden
          rounded-2xl
          border
          border-emerald-500/20
          bg-gray-800
          shadow-xl
        "
      >
        <div className="border-b border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <h2 className="font-bold text-white sm:text-lg">
                Today's M-PESA
              </h2>

              <p className="text-xs text-gray-500 sm:text-sm">
                Successful payments today
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Revenue Today
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400 sm:text-3xl">
              {formatCurrency(
                todayRevenue
              )}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Payments Today
            </p>

            <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {successfulToday.length.toLocaleString(
                "en-KE"
              )}
            </p>
          </div>
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* SECONDARY ANALYTICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {/* TOTAL TRANSACTIONS */}

        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <ReceiptText className="h-4 w-4" />

            <p className="text-sm">
              Total Transactions
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {safeTransactions.length.toLocaleString(
              "en-KE"
            )}
          </p>
        </div>

        {/* SUCCESS RATE */}

        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <Activity className="h-4 w-4" />

            <p className="text-sm">
              Success Rate
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-emerald-400">
            {successRate.toFixed(1)}%
          </p>
        </div>

        {/* AVERAGE PAYMENT */}

        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet className="h-4 w-4" />

            <p className="text-sm">
              Average Payment
            </p>
          </div>

          <p className="mt-3 text-xl font-bold text-white sm:text-2xl">
            {formatCurrency(
              averageTransaction
            )}
          </p>
        </div>

        {/* REVIEW */}

        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />

            <p className="text-sm">
              Needs Review
            </p>
          </div>

          <p
            className={`mt-3 text-2xl font-bold ${
              review.length > 0
                ? "text-orange-400"
                : "text-white"
            }`}
          >
            {review.length.toLocaleString(
              "en-KE"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MpesaAnalyticsTab;