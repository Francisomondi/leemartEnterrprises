import {

  BarChart,

  PlusCircle,

  ShoppingBasket,

  Wallet,

  Package,

  Download,

  ReceiptText,

  Phone,

  User,

  CalendarDays,

  Hash,

} from "lucide-react";



import {

  useEffect,

  useState,

} from "react";



import { motion } from "framer-motion";



import AnalyticsTab from "../components/AnalyticsTab";

import CreateProductForm from "../components/CreateProductForm";

import ProductsList from "../components/ProductsList";

import MpesaAnalyticsTab from "../components/MpesaAnalyticsTab";



import { useProductStore } from "../stores/useProductStore";

import axiosInstance from "../lib/axios";

import { useUserStore } from "../stores/useUserStore";



/*

 * ============================================================

 * ADMIN TABS

 * ============================================================

 */



const tabs = [

  {

    id: "create",

    label: "Create Product",

    icon: PlusCircle,

  },

  {

    id: "products",

    label: "Products",

    icon: ShoppingBasket,

  },

  {

    id: "analytics",

    label: "Analytics",

    icon: BarChart,

  },

  {

    id: "mpesa",

    label: "MPESA",

    icon: Wallet,

  },

  {

    id: "orders",

    label: "Orders",

    icon: Package,

  },

  {

    id: "mpesa-analytics",

    label: "MPESA Analytics",

    icon: BarChart,

  },

];



/*

 * ============================================================

 * HELPERS

 * ============================================================

 */



const formatCurrency = (amount) => {

  return new Intl.NumberFormat(

    "en-KE",

    {

      style: "currency",

      currency: "KES",

      minimumFractionDigits: 0,

    }

  ).format(Number(amount || 0));

};



const formatDate = (date) => {

  if (!date) return "—";



  return new Date(date).toLocaleString(

    "en-KE",

    {

      dateStyle: "medium",

      timeStyle: "short",

    }

  );

};



const StatusBadge = ({ status }) => {

  const normalizedStatus =

    status?.toLowerCase() || "";



  const success =

    normalizedStatus === "success" ||

    normalizedStatus === "successful" ||

    normalizedStatus === "completed" ||

    normalizedStatus === "paid";



  const pending =

    normalizedStatus === "pending" ||

    normalizedStatus === "processing";



  let styles =

    "bg-red-500/10 text-red-400 border-red-500/20";



  if (success) {

    styles =

      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  }



  if (pending) {

    styles =

      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

  }



  return (

    <span

      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}

    >

      {status || "Unknown"}

    </span>

  );

};



/*

 * ============================================================

 * ADMIN PAGE

 * ============================================================

 */



const AdminPage = () => {

  const [activeTab, setActiveTab] =

    useState("create");



  const { fetchAllProducts } =

    useProductStore();



  const { user } = useUserStore();



  const [successfulOrders, setSuccessfulOrders] =

    useState([]);



  const [ordersLoading, setOrdersLoading] =

    useState(true);



  const [transactions, setTransactions] =

    useState([]);



  const [loading, setLoading] =

    useState(true);



  /*

   * ============================================================

   * FETCH MPESA TRANSACTIONS

   * ============================================================

   */



  const fetchAllMpesaTransactions =

    async () => {

      try {

        setLoading(true);



        const res =

          await axiosInstance.get(

            "/mpesa/all",

            {

              withCredentials: true,

            }

          );



        setTransactions(

          Array.isArray(

            res.data.transactions

          )

            ? res.data.transactions

            : []

        );

      } catch (error) {

        console.error(

          "Failed to fetch MPESA transactions:",

          error

        );



        setTransactions([]);

      } finally {

        setLoading(false);

      }

    };



  /*

   * ============================================================

   * FETCH SUCCESSFUL ORDERS

   * ============================================================

   */



  const fetchSuccessfulOrders =

    async () => {

      try {

        setOrdersLoading(true);



        const res =

          await axiosInstance.get(

            "/orders/success",

            {

              withCredentials: true,

            }

          );



        console.log(

          "ORDERS RESPONSE:",

          res.data

        );



        if (Array.isArray(res.data)) {

          setSuccessfulOrders(

            res.data

          );

        } else if (

          Array.isArray(

            res.data.orders

          )

        ) {

          setSuccessfulOrders(

            res.data.orders

          );

        } else {

          setSuccessfulOrders([]);

        }

      } catch (error) {

        console.error(

          "Failed to fetch orders:",

          error

        );



        setSuccessfulOrders([]);

      } finally {

        setOrdersLoading(false);

      }

    };



  /*

   * ============================================================

   * INITIAL DATA

   * ============================================================

   */



  useEffect(() => {

    fetchAllProducts();

    fetchAllMpesaTransactions();

    fetchSuccessfulOrders();

  }, [fetchAllProducts]);



  /*

   * ============================================================

   * NORMALIZE ORDER PRODUCTS

   * ============================================================

   */



  const getOrderProducts = (order) => {

    if (!Array.isArray(order?.items)) {

      return [];

    }



    return order.items.map((item) => {

      const quantity =

        Number(item.quantity || 1);



      /*

      * IMPORTANT:

      * item.price is the price snapshot saved

      * when the order was created.

      *

      * Fall back to populated product price only

      * for older orders.

      */

      const unitPrice =

        Number(

          item.price ??

            item.product?.price ??

            0

        );



      return {

        id:

          item._id ||

          item.product?._id,



        name:

          item.product?.name ||

          "Unknown product",



        quantity,



        size:

          item.size || "",



        color:

          item.color || "",



        unitPrice,



        lineTotal:

          unitPrice * quantity,



        image:

          item.product?.images?.[0] ||

          "",

      };

    });

  };



  /*

   * ============================================================

   * EXPORT ORDERS

   * ============================================================

   */



  const exportOrdersToCSV = () => {
    if (!successfulOrders.length) {
      alert("No successful orders to export.");
      return;
    }

    const headers = [
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Products",
      "Subtotal",
      "Discount",
      "Delivery Fee",
      "Total Amount",
      "Delivery Location",
      "MPESA Receipt",
      "Order ID",
      "Payment Status",
      "Date",
    ];

    const rows = successfulOrders.map((order) => {
      const products = getOrderProducts(order)
        .map((product) =>
          [
            product.name,
            product.size ? `Size: ${product.size}` : null,
            product.color ? `Color: ${product.color}` : null,
            `Qty: ${product.quantity}`,
            `Unit: KES ${product.unitPrice}`,
            `Line Total: KES ${product.lineTotal}`,
          ]
            .filter(Boolean)
            .join(" | ")
        )
        .join(" || ");

      return [
        order.user?.name || "",
        order.user?.email || "",
        order.deliveryDetails?.phoneNumber || order.user?.phone || "",
        products,
        order.subtotal || 0,
        order.discountAmount || 0,
        order.deliveryDetails?.deliveryFee || 0,
        order.totalAmount || 0,
        order.deliveryDetails?.location || "",
        order.mpesaReceiptNumber || "",
        order._id || "",
        order.paymentStatus || "PAID",
        order.paidAt || order.createdAt
          ? new Date(order.paidAt || order.createdAt).toLocaleString("en-KE")
          : "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "successful-orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /*

   * ============================================================

   * PAGE

   * ============================================================

   */



  return (

    <div className="min-h-screen relative overflow-x-hidden">



      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 lg:py-16">



        {/* ============================= */}

        {/* HEADER */}

        {/* ============================= */}



        <motion.div

          initial={{

            opacity: 0,

            y: -20,

          }}

          animate={{

            opacity: 1,

            y: 0,

          }}

          className="mb-6 sm:mb-8"

        >

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 text-center">

            Admin Dashboard

          </h1>



          <p className="text-center text-sm sm:text-base text-gray-400 mt-2">

            Manage products,

            payments, orders and

            analytics

          </p>

        </motion.div>



        {/* ============================= */}

        {/* RESPONSIVE TABS */}

        {/* ============================= */}



        <div className="mb-6 sm:mb-10 -mx-3 sm:mx-0">



          <div className="flex gap-2 overflow-x-auto px-3 sm:px-0 pb-2 scrollbar-hide sm:flex-wrap sm:justify-center">



            {tabs.map((tab) => {

              const Icon =

                tab.icon;



              return (

                <button

                  key={tab.id}

                  type="button"

                  onClick={() =>

                    setActiveTab(

                      tab.id

                    )

                  }

                  className={`

                    flex

                    flex-none

                    items-center

                    justify-center

                    gap-2

                    whitespace-nowrap

                    rounded-lg

                    px-3

                    sm:px-4

                    py-2.5

                    text-sm

                    font-medium

                    transition

                    ${

                      activeTab ===

                      tab.id

                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"

                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"

                    }

                  `}

                >

                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />



                  {tab.label}

                </button>

              );

            })}



          </div>

        </div>



        {/* ============================= */}

        {/* OTHER TABS */}

        {/* ============================= */}



        {activeTab ===

          "create" && (

          <CreateProductForm />

        )}



        {activeTab ===

          "products" && (

          <ProductsList />

        )}



        {activeTab ===

          "analytics" && (

          <AnalyticsTab />

        )}



        {activeTab ===

          "mpesa-analytics" && (

          <MpesaAnalyticsTab

            transactions={

              transactions

            }

          />

        )}



        {/* ================================================== */}

        {/* MPESA */}

        {/* ================================================== */}



        {activeTab ===

          "mpesa" && (

          <section className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">



            <div className="p-4 sm:p-6 border-b border-gray-700">



              <div className="flex items-center gap-3">



                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">

                  <Wallet className="h-5 w-5 text-emerald-400" />

                </div>



                <div>

                  <h2 className="text-lg sm:text-2xl font-bold text-white">

                    MPESA

                    Transactions

                  </h2>



                  <p className="text-xs sm:text-sm text-gray-400">

                    {

                      transactions.length

                    }{" "}

                    transaction

                    {transactions.length ===

                    1

                      ? ""

                      : "s"}

                  </p>

                </div>



              </div>

            </div>



            {loading ? (

              <div className="p-8 text-center text-gray-400">

                Loading

                transactions...

              </div>

            ) : transactions.length ===

              0 ? (

              <div className="p-10 text-center">



                <Wallet className="w-10 h-10 mx-auto text-gray-600 mb-3" />



                <p className="font-medium text-gray-300">

                  No MPESA

                  transactions

                </p>



                <p className="text-sm text-gray-500 mt-1">

                  Transactions will

                  appear here once

                  payments are made.

                </p>



              </div>

            ) : (

              <>

                {/* ============================= */}

                {/* MOBILE TRANSACTION CARDS */}

                {/* ============================= */}



                <div className="md:hidden divide-y divide-gray-700">



                  {transactions.map(

                    (tx) => (

                      <div

                        key={

                          tx._id

                        }

                        className="p-4"

                      >



                        <div className="flex items-start justify-between gap-3 mb-4">



                          <div className="min-w-0">



                            <p className="font-semibold text-white truncate">

                              {tx

                                .user

                                ?.name ||

                                "Unknown customer"}

                            </p>



                            <p className="text-xs text-gray-500 truncate mt-1">

                              {tx

                                .user

                                ?.email ||

                                "No email"}

                            </p>



                          </div>



                          <StatusBadge

                            status={

                              tx.status

                            }

                          />



                        </div>



                        <div className="grid grid-cols-2 gap-3">



                          <div className="bg-gray-900/60 rounded-lg p-3">



                            <p className="text-xs text-gray-500 mb-1">

                              Amount

                            </p>



                            <p className="font-bold text-emerald-400">

                              {formatCurrency(

                                tx.amount

                              )}

                            </p>



                          </div>



                          <div className="bg-gray-900/60 rounded-lg p-3 min-w-0">



                            <p className="text-xs text-gray-500 mb-1">

                              Phone

                            </p>



                            <p className="text-sm text-gray-200 truncate">

                              {tx.phoneNumber ||

                                "—"}

                            </p>



                          </div>



                        </div>



                        <div className="mt-4 space-y-3 text-sm">



                          <div className="flex items-start gap-2">



                            <ReceiptText className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />



                            <div className="min-w-0">

                              <p className="text-xs text-gray-500">

                                Receipt

                              </p>



                              <p className="font-mono text-gray-300 break-all">

                                {tx.mpesaReceiptNumber ||

                                  "—"}

                              </p>

                            </div>



                          </div>



                          <div className="flex items-start gap-2">



                            <CalendarDays className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />



                            <div>

                              <p className="text-xs text-gray-500">

                                Date

                              </p>



                              <p className="text-gray-300">

                                {formatDate(

                                  tx.createdAt

                                )}

                              </p>

                            </div>



                          </div>



                        </div>



                      </div>

                    )

                  )}



                </div>



                {/* ============================= */}

                {/* DESKTOP MPESA TABLE */}

                {/* ============================= */}



                <div className="hidden md:block overflow-x-auto">



                  <table className="w-full text-sm">



                    <thead className="bg-gray-900/80 text-gray-400">



                      <tr>

                        <th className="px-4 py-3 text-left font-medium">

                          Customer

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Phone

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Receipt

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Amount

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Status

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Date

                        </th>

                      </tr>



                    </thead>



                    <tbody className="divide-y divide-gray-700">



                      {transactions.map(

                        (tx) => (

                          <tr

                            key={

                              tx._id

                            }

                            className="hover:bg-gray-700/30 transition"

                          >



                            <td className="px-4 py-4">



                              <p className="font-medium text-white">

                                {tx

                                  .user

                                  ?.name ||

                                  "—"}

                              </p>



                              <p className="text-xs text-gray-500 mt-1">

                                {tx

                                  .user

                                  ?.email ||

                                  ""}

                              </p>



                            </td>



                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">

                              {tx.phoneNumber ||

                                "—"}

                            </td>



                            <td className="px-4 py-4 font-mono text-gray-300 whitespace-nowrap">

                              {tx.mpesaReceiptNumber ||

                                "—"}

                            </td>



                            <td className="px-4 py-4 font-semibold text-emerald-400 whitespace-nowrap">

                              {formatCurrency(

                                tx.amount

                              )}

                            </td>



                            <td className="px-4 py-4">

                              <StatusBadge

                                status={

                                  tx.status

                                }

                              />

                            </td>



                            <td className="px-4 py-4 whitespace-nowrap text-gray-400">

                              {formatDate(

                                tx.createdAt

                              )}

                            </td>



                          </tr>

                        )

                      )}



                    </tbody>

                  </table>



                </div>

              </>

            )}



          </section>

        )}



        {/* ================================================== */}

        {/* ORDERS */}

        {/* ================================================== */}



        {activeTab ===

          "orders" && (

          <section className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">



            {/* HEADER */}



            <div className="p-4 sm:p-6 border-b border-gray-700">



              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">



                <div className="flex items-center gap-3">



                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">

                    <Package className="h-5 w-5 text-emerald-400" />

                  </div>



                  <div>

                    <h2 className="text-lg sm:text-2xl font-bold text-white">

                      Successful

                      Orders

                    </h2>



                    <p className="text-xs sm:text-sm text-gray-400 mt-1">

                      {

                        successfulOrders.length

                      }{" "}

                      successful order

                      {successfulOrders.length ===

                      1

                        ? ""

                        : "s"}

                    </p>

                  </div>



                </div>



                <button

                  type="button"

                  onClick={

                    exportOrdersToCSV

                  }

                  disabled={

                    !successfulOrders.length

                  }

                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition"

                >

                  <Download className="h-4 w-4" />



                  Export CSV

                </button>



              </div>

            </div>



            {ordersLoading ? (

              <div className="p-8 text-center text-gray-400">

                Loading orders...

              </div>

            ) : successfulOrders.length ===

              0 ? (

              <div className="p-10 text-center">



                <Package className="w-10 h-10 mx-auto text-gray-600 mb-3" />



                <p className="font-medium text-gray-300">

                  No successful

                  orders yet

                </p>



                <p className="text-sm text-gray-500 mt-1">

                  Completed customer

                  orders will appear

                  here.

                </p>



              </div>

            ) : (

              <>

                {/* ============================= */}

                {/* MOBILE ORDER CARDS */}

                {/* ============================= */}



                <div className="md:hidden divide-y divide-gray-700">



                  {successfulOrders.map(

                    (order) => {

                      const products =

                        getOrderProducts(

                          order

                        );



                      return (

                        <article

                          key={

                            order._id

                          }

                          className="p-4"

                        >



                          {/* CUSTOMER */}



                          <div className="flex items-start justify-between gap-3 mb-4">



                            <div className="flex items-start gap-3 min-w-0">



                              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">

                                <User className="h-5 w-5 text-gray-400" />

                              </div>



                              <div className="min-w-0">



                                <p className="font-semibold text-white truncate">

                                  {order

                                    .user

                                    ?.name ||

                                    "Unknown customer"}

                                </p>



                                <p className="text-xs text-gray-500 truncate mt-1">

                                  {order

                                    .user

                                    ?.email ||

                                    "No email"}

                                </p>



                              </div>



                            </div>



                            <span className="inline-flex shrink-0 items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">

                              Paid

                            </span>



                          </div>



                          {/* AMOUNT / PHONE */}



                          <div className="grid grid-cols-2 gap-3 mb-4">



                            <div className="bg-gray-900/60 rounded-lg p-3">



                              <p className="text-xs text-gray-500 mb-1">

                                Total

                              </p>



                              <p className="font-bold text-emerald-400">

                                {formatCurrency(

                                  order.totalAmount

                                )}

                              </p>



                            </div>



                            <div className="bg-gray-900/60 rounded-lg p-3 min-w-0">



                              <div className="flex items-center gap-1 mb-1 text-gray-500">

                                <Phone className="h-3 w-3" />



                                <p className="text-xs">

                                  Phone

                                </p>

                              </div>



                              <p className="text-sm text-gray-200 truncate">

                                {order.deliveryDetails?.phoneNumber ||
                                  order.user?.phone ||
                                  "—"}

                              </p>



                            </div>



                          </div>



                          {/* PRODUCTS */}



                        <div className="mb-4">

                          <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">

                            Products

                          </p>



                          {products.length > 0 ? (

                            <div className="space-y-3">

                              {products.map(

                                (product, index) => (

                                  <div

                                    key={

                                      product.id ||

                                      `${order._id}-${index}`

                                    }

                                    className="rounded-xl border border-gray-700 bg-gray-900/50 p-3"

                                  >

                                    <div className="flex gap-3">

                                      {/* PRODUCT IMAGE */}



                                      {product.image ? (

                                        <img

                                          src={product.image}

                                          alt={product.name}

                                          className="h-16 w-16 shrink-0 rounded-lg object-cover"

                                        />

                                      ) : (

                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-800">

                                          <Package className="h-6 w-6 text-gray-600" />

                                        </div>

                                      )}



                                      <div className="min-w-0 flex-1">

                                        {/* NAME */}



                                        <p className="font-medium text-white">

                                          {product.name}

                                        </p>



                                        {/* VARIANTS */}



                                        <div className="mt-2 flex flex-wrap gap-2">

                                          {product.size && (

                                            <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-300">

                                              Size:{" "}

                                              <span className="font-semibold text-white">

                                                {product.size}

                                              </span>

                                            </span>

                                          )}



                                          {product.color && (

                                            <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-300">

                                              Color:{" "}

                                              <span className="font-semibold text-white">

                                                {product.color}

                                              </span>

                                            </span>

                                          )}



                                          <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-300">

                                            Qty:{" "}

                                            <span className="font-semibold text-white">

                                              {product.quantity}

                                            </span>

                                          </span>

                                        </div>



                                        {/* PRICE */}



                                        <div className="mt-3 flex items-center justify-between gap-3">

                                          <span className="text-xs text-gray-500">

                                            {formatCurrency(

                                              product.unitPrice

                                            )}{" "}

                                            each

                                          </span>



                                          <span className="text-sm font-bold text-emerald-400">

                                            {formatCurrency(

                                              product.lineTotal

                                            )}

                                          </span>

                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                )

                              )}

                            </div>

                          ) : (

                            <p className="text-sm text-gray-500">

                              No product data

                            </p>

                          )}

                        </div>



                          {/* ORDER DETAILS */}



                          <div className="space-y-3 pt-4 border-t border-gray-700">



                            <div className="flex items-start gap-2">



                              <ReceiptText className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />



                              <div className="min-w-0">



                                <p className="text-xs text-gray-500">

                                  MPESA Receipt

                                </p>



                                <p className="font-mono text-sm text-gray-300 break-all">

                                  {order.mpesaReceiptNumber ||

                                    "—"}

                                </p>



                              </div>



                            </div>



                            <div className="flex items-start gap-2">



                              <Hash className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />



                              <div className="min-w-0">



                                <p className="text-xs text-gray-500">

                                  Order ID

                                </p>



                                <p className="font-mono text-xs text-gray-400 break-all">

                                  {order._id ||

                                    "—"}

                                </p>



                              </div>



                            </div>



                            <div className="flex items-start gap-2">



                              <CalendarDays className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />



                              <div>



                                <p className="text-xs text-gray-500">

                                  Date

                                </p>



                                <p className="text-sm text-gray-300">

                                  {formatDate(

                                    order.createdAt

                                  )}

                                </p>



                              </div>



                            </div>



                          </div>



                        </article>

                      );

                    }

                  )}



                </div>



                {/* ============================= */}

                {/* DESKTOP ORDERS TABLE */}

                {/* ============================= */}



                <div className="hidden md:block overflow-x-auto">



                  <table className="w-full text-sm">



                    <thead className="bg-gray-900/80 text-gray-400">



                      <tr>

                        <th className="px-4 py-3 text-left font-medium">

                          Customer

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Products

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Amount

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Receipt

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Order ID

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Phone

                        </th>



                        <th className="px-4 py-3 text-left font-medium">

                          Date

                        </th>

                      </tr>



                    </thead>



                    <tbody className="divide-y divide-gray-700">



                      {successfulOrders.map(

                        (order) => {

                          const products =

                            getOrderProducts(

                              order

                            );



                          return (

                            <tr

                              key={

                                order._id

                              }

                              className="align-top hover:bg-gray-700/30 transition"

                            >



                              <td className="px-4 py-4 min-w-[180px]">



                                <p className="font-medium text-white">

                                  {order

                                    .user

                                    ?.name ||

                                    "—"}

                                </p>



                                <p className="text-xs text-gray-500 mt-1">

                                  {order

                                    .user

                                    ?.email ||

                                    ""}

                                </p>



                              </td>



                              <td className="min-w-[320px] px-4 py-4">
                                {products.length > 0 ? (
                                  <div className="space-y-3">
                                    {products.map((product, index) => (
                                      <div
                                        key={product.id || `${order._id}-${index}`}
                                        className="rounded-lg border border-gray-700 bg-gray-900/40 p-3"
                                      >
                                        <div className="flex gap-3">
                                          {product.image ? (
                                            <img
                                              src={product.image}
                                              alt={product.name}
                                              className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-800">
                                              <Package className="h-5 w-5 text-gray-600" />
                                            </div>
                                          )}

                                          <div className="min-w-0 flex-1">
                                            <p className="font-medium text-white">
                                              {product.name}
                                            </p>

                                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                              {product.size && (
                                                <span className="text-gray-400">
                                                  Size:{" "}
                                                  <strong className="text-gray-200">
                                                    {product.size}
                                                  </strong>
                                                </span>
                                              )}

                                              {product.color && (
                                                <span className="text-gray-400">
                                                  Color:{" "}
                                                  <strong className="text-gray-200">
                                                    {product.color}
                                                  </strong>
                                                </span>
                                              )}

                                              <span className="text-gray-400">
                                                Qty:{" "}
                                                <strong className="text-gray-200">
                                                  {product.quantity}
                                                </strong>
                                              </span>
                                            </div>

                                            <div className="mt-2 text-xs">
                                              <span className="text-gray-500">
                                                {formatCurrency(product.unitPrice)} × {product.quantity}
                                              </span>
                                              <span className="ml-2 font-semibold text-emerald-400">
                                                = {formatCurrency(product.lineTotal)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No product data</span>
                                )}
                              </td>



                              <td className="px-4 py-4 font-semibold text-emerald-400 whitespace-nowrap">

                                {formatCurrency(

                                  order.totalAmount

                                )}

                              </td>



                              <td className="px-4 py-4 font-mono whitespace-nowrap text-gray-300">

                                {order.mpesaReceiptNumber ||

                                  "—"}

                              </td>



                              <td

                                className="px-4 py-4 font-mono text-xs text-gray-400 max-w-[160px] truncate"

                                title={

                                  order._id

                                }

                              >

                                {order._id ||

                                  "—"}

                              </td>



                              <td className="px-4 py-4 whitespace-nowrap text-gray-300">

                                {order.deliveryDetails?.phoneNumber ||
                                  order.user?.phone ||
                                  "—"}

                              </td>



                              <td className="px-4 py-4 whitespace-nowrap text-gray-400">

                                {formatDate(

                                  order.createdAt

                                )}

                              </td>



                            </tr>

                          );

                        }

                      )}



                    </tbody>

                  </table>



                </div>

              </>

            )}



          </section>

        )}



      </div>

    </div>

  );

};



export default AdminPage;