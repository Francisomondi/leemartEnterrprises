import { useEffect, useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import axiosInstance from "../lib/axios";

const ProfilePage = () => {
  const { user, fetchProfile, updateProfile, loading } = useUserStore();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [orders, setOrders] = useState([]);
  const [mpesaTransactions, setMpesaTransactions] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
      });
      fetchOrders();
      fetchMpesaTransactions();
    }
  }, [user]);

  // Normalize phone for MPESA
  const normalizePhone = (phone) => {
    let p = phone.trim();
    if (/^0(7|1)\d{8}$/.test(p)) {
      p = "254" + p.slice(1);
    }
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedPhone = normalizePhone(form.phone);

    if (!/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      toast.error("Invalid Safaricom phone number");
      return;
    }

    try {
      await updateProfile({ name: form.name, phone: normalizedPhone });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axiosInstance.put("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated!");
      fetchProfile(); // Refresh user data
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders/my");
      setOrders(res.data);
    } catch {
      setOrders([]);
    }
  };

  const fetchMpesaTransactions = async () => {
    try {
      const res = await axiosInstance.get("/mpesa/transactions");
      setMpesaTransactions(res.data);
    } catch {
      setMpesaTransactions([]);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">My Profile</h1>

      {/* User Info & Avatar */}
      <div className="bg-gray-900 shadow rounded-lg p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-2 border-emerald-500"
          />
          <label className="cursor-pointer text-sm text-emerald-400 hover:text-emerald-300">
            {avatarLoading ? "Uploading..." : "Change Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400">Full Name</p>
            <p className="text-white font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-white font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-white font-semibold">{user.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-gray-400">Registered On</p>
            <p className="text-white font-semibold">
              {user.createdAt
                ? format(new Date(user.createdAt), "PPP")
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-gray-900 shadow rounded-lg p-6 md:p-10">
        <h2 className="text-xl font-bold text-emerald-400 mb-4">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name"
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 py-3 rounded text-white font-semibold hover:bg-emerald-700 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 shadow rounded-lg p-6 md:p-10">
        <h2 className="text-xl font-bold text-emerald-400 mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="bg-gray-800 p-3 rounded flex justify-between items-center"
              >
                <span>Order #{order._id.slice(-6)}</span>
                <span className="text-emerald-400 font-semibold">
                  KES {order.total}
                </span>
                <span className="text-gray-400 text-sm">
                  {format(new Date(order.createdAt), "PPP")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent MPESA Transactions */}
      <div className="bg-gray-900 shadow rounded-lg p-6 md:p-10">
        <h2 className="text-xl font-bold text-emerald-400 mb-4">
          Recent MPESA Transactions
        </h2>
        {mpesaTransactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {mpesaTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx._id}
                className="bg-gray-800 p-3 rounded flex justify-between items-center"
              >
                <span>{tx.transactionType}</span>
                <span className="text-emerald-400 font-semibold">
                  KES {tx.amount}
                </span>
                <span className="text-gray-400 text-sm">
                  {format(new Date(tx.date), "PPP p")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
