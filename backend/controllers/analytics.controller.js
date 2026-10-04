import MpesaOrder from "../models/mpesaOrder.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

/*
 * ============================================================
 * GET GENERAL ANALYTICS
 * ============================================================
 *
 * Revenue and sales are calculated ONLY from successfully
 * paid M-PESA orders.
 *
 * Pending, failed and unpaid orders are excluded.
 */
export const getAnalyticsData = async () => {
  try {
    /*
     * Run independent queries in parallel.
     */
    const [
      totalUsers,
      totalProducts,
      salesData,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      MpesaOrder.aggregate([
        /*
         * Only real completed sales.
         */
        {
          $match: {
            isPaid: true,
            paymentStatus: "PAID",
          },
        },

        /*
         * Calculate total orders and revenue.
         */
        {
          $group: {
            _id: null,

            totalSales: {
              $sum: 1,
            },

            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const sales =
      salesData?.[0] || {
        totalSales: 0,
        totalRevenue: 0,
      };

    return {
      users: totalUsers,

      products: totalProducts,

      totalSales:
        Number(
          sales.totalSales
        ) || 0,

      totalRevenue:
        Number(
          sales.totalRevenue
        ) || 0,
    };
  } catch (error) {
    console.error(
      "GET ANALYTICS DATA ERROR:",
      error
    );

    throw error;
  }
};

/*
 * ============================================================
 * GET DAILY SALES DATA
 * ============================================================
 *
 * Returns:
 *
 * [
 *   {
 *     date: "2026-10-01",
 *     sales: 4,
 *     revenue: 12500
 *   },
 *   ...
 * ]
 *
 * Only successfully paid orders are counted.
 */
export const getDailySalesData = async (
  startDate,
  endDate
) => {
  try {
    /*
     * ========================================================
     * VALIDATE DATES
     * ========================================================
     */

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      throw new Error(
        "Invalid analytics date range"
      );
    }

    /*
     * ========================================================
     * QUERY PAID ORDERS
     * ========================================================
     *
     * We use paidAt instead of createdAt.
     *
     * This is important:
     *
     * An order may be created today but paid tomorrow.
     * The sale belongs to the day payment was verified.
     */

    const dailySalesData =
      await MpesaOrder.aggregate([
        {
          $match: {
            isPaid: true,

            paymentStatus:
              "PAID",

            paidAt: {
              $gte: start,
              $lte: end,
            },
          },
        },

        /*
         * ====================================================
         * GROUP BY PAYMENT DATE
         * ====================================================
         *
         * timezone:
         * Africa/Nairobi
         *
         * This prevents Kenyan sales close to midnight from
         * being grouped under the wrong UTC calendar date.
         */

        {
          $group: {
            _id: {
              $dateToString: {
                format:
                  "%Y-%m-%d",

                date: "$paidAt",

                timezone:
                  "Africa/Nairobi",
              },
            },

            sales: {
              $sum: 1,
            },

            revenue: {
              $sum:
                "$totalAmount",
            },
          },
        },

        /*
         * Oldest -> newest.
         */
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    /*
     * ========================================================
     * CREATE LOOKUP MAP
     * ========================================================
     *
     * More efficient than .find() for every date.
     */

    const salesMap =
      new Map();

    for (
      const item of
      dailySalesData
    ) {
      salesMap.set(
        item._id,
        {
          sales:
            Number(
              item.sales
            ) || 0,

          revenue:
            Number(
              item.revenue
            ) || 0,
        }
      );
    }

    /*
     * ========================================================
     * INCLUDE DAYS WITH ZERO SALES
     * ========================================================
     */

    const dateArray =
      getDatesInRange(
        start,
        end
      );

    return dateArray.map(
      (date) => {
        const found =
          salesMap.get(date);

        return {
          date,

          /*
           * Your AnalyticsTab chart currently expects `name`
           * as its XAxis dataKey.
           *
           * Keep both `date` and `name`.
           */
          name: formatChartDate(
            date
          ),

          sales:
            found?.sales || 0,

          revenue:
            found?.revenue || 0,
        };
      }
    );
  } catch (error) {
    console.error(
      "GET DAILY SALES DATA ERROR:",
      error
    );

    throw error;
  }
};

/*
 * ============================================================
 * GET DATES IN RANGE
 * ============================================================
 *
 * Generates:
 *
 * [
 *   "2026-10-01",
 *   "2026-10-02",
 *   "2026-10-03"
 * ]
 */
function getDatesInRange(
  startDate,
  endDate
) {
  const dates = [];

  /*
   * Work with YYYY-MM-DD values instead of mutating the
   * original Date objects.
   */

  const current =
    new Date(startDate);

  const end =
    new Date(endDate);

  /*
   * Normalize to UTC midnight for predictable iteration.
   */
  current.setUTCHours(
    0,
    0,
    0,
    0
  );

  end.setUTCHours(
    0,
    0,
    0,
    0
  );

  while (
    current <= end
  ) {
    dates.push(
      current
        .toISOString()
        .split("T")[0]
    );

    current.setUTCDate(
      current.getUTCDate() +
        1
    );
  }

  return dates;
}

/*
 * ============================================================
 * FORMAT CHART DATE
 * ============================================================
 *
 * "2026-10-05"
 *
 * becomes:
 *
 * "05 Oct"
 */
function formatChartDate(
  dateString
) {
  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return new Intl.DateTimeFormat(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }
  ).format(date);
}