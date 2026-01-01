import { BarChart, PlusCircle, ShoppingBasket ,Wallet} from "lucide-react";
import { useEffect, useState } from "react";
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
	 { id: "mpesa-analytics", label: "MPESA Analytics", icon: BarChart },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();
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

	}, [fetchAllProducts]);

	return (
	<div className='min-h-screen relative overflow-hidden'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.h1
					className='text-4xl font-bold mb-8 text-emerald-400 text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Admin Dashboard
				</motion.h1>

				<div className='flex justify-center mb-8'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</button>
					))}
				</div>
				{activeTab === "create" && <CreateProductForm />}
				{activeTab === "products" && <ProductsList />}
				{activeTab === "analytics" && <AnalyticsTab />}
				{activeTab === "mpesa-analytics" && (<MpesaAnalyticsTab transactions={transactions} />)}
				
			</div>

		{activeTab === "mpesa" && (
  			<div className="p-6 rounded shadow">
				<h2 className="text-2xl font-bold mb-4">MPESA Transactions</h2>

				{loading ? (
				<p>Loading transactions...</p>
				) : !Array.isArray(transactions) || transactions.length === 0 ? (
				<p>No MPESA transactions found.</p>
				) : (
				<table className="w-full border">
					<thead>
					<tr className="bg-gray-900">
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
							<br />
							<span className="text-xs text-gray-500">
							{tx.user?.email}
							</span>
						</td>

						<td className="p-2">{tx.phoneNumber || "—"}</td>
						<td className="p-2">{tx.mpesaReceiptNumber || "—"}</td>
						<td className="p-2 font-semibold">KES {tx.amount}</td>

						<td className="p-2">
							<span
							className={
								tx.status === "SUCCESS"
								? "text-green-600"
								: tx.status === "FAILED"
								? "text-red-600"
								: "text-yellow-600"
							}
							>
							{tx.status}
							</span>
						</td>

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


	</div>
	);
};
export default AdminPage;
