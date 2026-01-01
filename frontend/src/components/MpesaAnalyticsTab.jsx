import { Wallet, TrendingUp, XCircle, Clock } from "lucide-react";

const MpesaAnalyticsTab = ({ transactions }) => {
  const successful = transactions.filter(tx => tx.status === "SUCCESS");
  const failed = transactions.filter(tx => tx.status === "FAILED");
  const pending = transactions.filter(tx => tx.status === "PENDING");

  const totalRevenue = successful.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  const todayRevenue = successful
    .filter(tx => {
      const today = new Date().toDateString();
      return new Date(tx.createdAt).toDateString() === today;
    })
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Total Revenue */}
      <div className="bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <Wallet className="text-emerald-500" />
          <h3 className="text-gray-300">Total Revenue</h3>
        </div>
        <p className="text-2xl font-bold mt-2">KES {totalRevenue}</p>
      </div>

      {/* Successful Payments */}
      <div className="bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-green-500" />
          <h3 className="text-gray-300">Successful</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{successful.length}</p>
      </div>

      {/* Failed Payments */}
      <div className="bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <XCircle className="text-red-500" />
          <h3 className="text-gray-300">Failed</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{failed.length}</p>
      </div>

      {/* Pending */}
      <div className="bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-500" />
          <h3 className="text-gray-300">Pending</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{pending.length}</p>
      </div>

      {/* Today Revenue */}
      <div className="md:col-span-4 bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-gray-300 mb-2">Today’s Revenue</h3>
        <p className="text-3xl font-bold text-emerald-400">
          KES {todayRevenue}
        </p>
      </div>

    </div>
  );
};

export default MpesaAnalyticsTab;
