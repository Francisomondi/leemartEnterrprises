import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import axios from "../lib/axios";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-KE");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

/*
 * ============================================================
 * CUSTOM TOOLTIP
 * ============================================================
 */

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !Array.isArray(payload) ||
    !payload.length
  ) {
    return null;
  }

  const sales =
    payload.find(
      (item) =>
        item.dataKey === "sales"
    )?.value || 0;

  const revenue =
    payload.find(
      (item) =>
        item.dataKey === "revenue"
    )?.value || 0;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/95 p-3 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-white">
        {label}
      </p>

      <div className="space-y-1 text-sm">
        <p className="text-emerald-400">
          Sales:{" "}
          <span className="font-semibold">
            {formatNumber(sales)}
          </span>
        </p>

        <p className="text-blue-400">
          Revenue:{" "}
          <span className="font-semibold">
            {formatCurrency(revenue)}
          </span>
        </p>
      </div>
    </div>
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
  icon: Icon,
  subtitle,
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Icon className="h-5 w-5 text-emerald-400" />
          </div>

          <TrendingUp className="h-4 w-4 text-gray-600" />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 sm:text-sm">
          {title}
        </p>

        <h3 className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">
          {value}
        </h3>

        {subtitle && (
          <p className="mt-2 text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <Icon className="absolute -bottom-5 -right-5 h-28 w-28 text-emerald-500/[0.04] sm:h-32 sm:w-32" />
    </motion.div>
  );
};

/*
 * ============================================================
 * ANALYTICS TAB
 * ============================================================
 */

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] =
    useState({
      users: 0,
      products: 0,
      totalSales: 0,
      totalRevenue: 0,
    });

  const [
    dailySalesData,
    setDailySalesData,
  ] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * FETCH ANALYTICS
   * ==========================================================
   */

  const fetchAnalyticsData =
    async () => {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await axios.get(
            "/analytics",
            {
              withCredentials: true,
            }
          );

        console.log(
          "ANALYTICS RESPONSE:",
          response.data
        );

        setAnalyticsData({
          users:
            Number(
              response.data
                ?.analyticsData
                ?.users
            ) || 0,

          products:
            Number(
              response.data
                ?.analyticsData
                ?.products
            ) || 0,

          totalSales:
            Number(
              response.data
                ?.analyticsData
                ?.totalSales
            ) || 0,

          totalRevenue:
            Number(
              response.data
                ?.analyticsData
                ?.totalRevenue
            ) || 0,
        });

        setDailySalesData(
          Array.isArray(
            response.data
              ?.dailySalesData
          )
            ? response.data
                .dailySalesData
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching analytics data:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to load analytics data."
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-emerald-400" />

          <p className="mt-3 text-sm text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="font-medium text-red-400">
          {error}
        </p>

        <button
          type="button"
          onClick={
            fetchAnalyticsData
          }
          className="
            mt-4
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-emerald-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-emerald-700
          "
        >
          <RefreshCw className="h-4 w-4" />

          Try Again
        </button>
      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <div className="w-full">
      {/* ================================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================================== */}

      <div
        className="
          mb-6
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          xl:grid-cols-4
        "
      >
        <AnalyticsCard
          title="Total Users"
          value={formatNumber(
            analyticsData.users
          )}
          icon={Users}
          subtitle="Registered customers"
          delay={0}
        />

        <AnalyticsCard
          title="Total Products"
          value={formatNumber(
            analyticsData.products
          )}
          icon={Package}
          subtitle="Products in catalogue"
          delay={0.05}
        />

        <AnalyticsCard
          title="Successful Sales"
          value={formatNumber(
            analyticsData.totalSales
          )}
          icon={ShoppingCart}
          subtitle="Paid orders"
          delay={0.1}
        />

        <AnalyticsCard
          title="Total Revenue"
          value={formatCurrency(
            analyticsData.totalRevenue
          )}
          icon={DollarSign}
          subtitle="Revenue from paid orders"
          delay={0.15}
        />
      </div>

      {/* ================================================== */}
      {/* SALES CHART */}
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
          border-gray-700/70
          bg-gray-800
          shadow-xl
        "
      >
        {/* HEADER */}

        <div className="border-b border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Sales Overview
          </h2>

          <p className="mt-1 text-xs text-gray-400 sm:text-sm">
            Successful orders and revenue
            over time
          </p>
        </div>

        {/* CHART */}

        {dailySalesData.length ===
        0 ? (
          <div className="flex min-h-[320px] items-center justify-center p-6">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-10 w-10 text-gray-600" />

              <p className="mt-3 font-medium text-gray-300">
                No sales data yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Successful orders will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[320px] w-full p-2 sm:h-[400px] sm:p-4 lg:p-6">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  dailySalesData
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  yAxisId="left"
                  stroke="#9CA3AF"
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(
                    value
                  ) =>
                    Number(
                      value
                    ).toLocaleString(
                      "en-KE",
                      {
                        notation:
                          "compact",
                      }
                    )
                  }
                />

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Legend />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  name="Sales"
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default AnalyticsTab;