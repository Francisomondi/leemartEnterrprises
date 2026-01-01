import React, { useState } from 'react'

const MpesaTransactions = () => {

    //const [activeTab, setActiveTab] = useState("create");
    //const { fetchAllProducts } = useProductStore();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
  return (
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
  )
}

export default MpesaTransactions
