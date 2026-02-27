import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  Wallet,
  Package,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import MpesaAnalyticsTab from "../components/MpesaAnalyticsTab";
import { useProductStore } from "../stores/useProductStore";
import axiosInstance from "../lib/axios";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "mpesa", label: "MPESA", icon: Wallet },
  { id: "orders", label: "Orders", icon: Package },
  { id: "mpesa-analytics", label: "MPESA Analytics", icon: BarChart },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();
  const [successfulOrders, setSuccessfulOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllMpesaTransactions = async () => {
    try {
      const res = await axiosInstance.get("/mpesa/all", {
        withCredentials: true,
      });

      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch MPESA transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllMpesaTransactions();
    fetchSuccessfulOrders()
  }, [fetchAllProducts]);

  /**
   * ONLY SUCCESSFUL ORDERS
   */
  //const successfulOrders = orders;
  /**
   * Normalize products/items safely
   */


  const fetchSuccessfulOrders = async () => {
  try {
    const res = await axiosInstance.get("/orders/success", {
      withCredentials: true,
    });

    setSuccessfulOrders(res.data || []);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  } finally {
    setOrdersLoading(false);
  }
};
  const getOrderProducts = (order) => {
  if (!order?.items) return [];

  return order.items.map((item) => ({
    name: item.product?.name,
    quantity: item.quantity || 1,
  }));
};

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* TABS */}
        <div className="flex flex-wrap justify-center mb-10 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "mpesa-analytics" && (
          <MpesaAnalyticsTab transactions={transactions} />
        )}

        {/* MPESA TRANSACTIONS */}
        {activeTab === "mpesa" && (
          <div className="p-6 rounded-lg bg-gray-800 shadow">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              MPESA Transactions
            </h2>

            {loading ? (
              <p>Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p>No MPESA transactions found.</p>
            ) : (
              <table className="w-full border border-gray-700 text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-2">User</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Receipt</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-t">
                      <td className="p-2">
                        {tx.user?.name || "—"}
                        <div className="text-xs text-gray-500">
                          {tx.user?.email}
                        </div>
                      </td>
                      <td className="p-2">{tx.phoneNumber}</td>
                      <td className="p-2">{tx.mpesaReceiptNumber || "—"}</td>
                      <td className="p-2 font-semibold">KES {tx.amount}</td>
                      <td className="p-2">{tx.status}</td>
                      <td className="p-2">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ORDERS TAB (SUCCESSFUL ONLY) */}
        {activeTab === "orders" && (
          <div className="p-6 rounded-lg bg-gray-800 shadow">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">
              Successful Orders
            </h2>

            {successfulOrders.length === 0 ? (
              <p>No successful orders yet.</p>
            ) : (
              <table className="w-full border border-gray-700 text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Products</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Receipt</th>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {successfulOrders.map((order) => {
                    const products = getOrderProducts(order);

                    return (
                      <tr key={order._id} className="border-t align-top">
                        <td className="p-2">
                          {order.user?.name || "—"}
                          <div className="text-xs text-gray-500">
                            {order.user?.email}
                          </div>
                        </td>

                        <td className="p-2">
                          {products.length > 0 ? (
                            <ul className="space-y-1">
                              {products.map((p, idx) => (
                                <li key={idx}>
                                  • {p.name}
                                  {p.quantity && (
                                    <span className="text-gray-400">
                                      {" "}
                                      × {p.quantity}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">
                              No product data
                            </span>
                          )}
                        </td>

                        <td className="p-2 font-semibold">
                          KES {order.totalAmount}
                        </td>
                        <td className="p-2 font-mono">
                          {order.mpesaReceiptNumber}
                        </td>
                        <td className="p-2">{order._id|| "—"}</td>
                        <td className="p-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;