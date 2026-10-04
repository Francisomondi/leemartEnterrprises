import { useEffect, useState } from "react";

import {
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  ShoppingBag,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import { format } from "date-fns";
import { toast } from "react-hot-toast";

import { useUserStore } from "../stores/useUserStore";
import axiosInstance from "../lib/axios";

/*
 * ============================================================
 * CURRENCY FORMATTER
 * ============================================================
 */

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/*
 * ============================================================
 * DATE FORMATTER
 * ============================================================
 */

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  try {
    return format(new Date(date), "PPP p");
  } catch {
    return "Not available";
  }
};

/*
 * ============================================================
 * NORMALIZE STATUS
 * ============================================================
 */

const normalizeStatus = (status) =>
  String(status || "").trim().toUpperCase();

/*
 * ============================================================
 * TRANSACTION STATUS BADGE
 * ============================================================
 */

const TransactionStatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status);

  if (normalized === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
        <CheckCircle2 size={13} />
        SUCCESS
      </span>
    );
  }

  if (normalized === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
        <XCircle size={13} />
        FAILED
      </span>
    );
  }

  if (normalized === "REVIEW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400">
        <Clock size={13} />
        REVIEW
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
      <Clock size={13} />
      {normalized || "PENDING"}
    </span>
  );
};

/*
 * ============================================================
 * PRODUCT IMAGE HELPER
 * ============================================================
 */

const getProductImage = (product) => {
  if (!product) {
    return null;
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    if (
      firstImage &&
      typeof firstImage === "object"
    ) {
      return (
        firstImage.url ||
        firstImage.secure_url ||
        null
      );
    }
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  return null;
};

/*
 * ============================================================
 * PROFILE PAGE
 * ============================================================
 */

const ProfilePage = () => {
  const {
    user,
    fetchProfile,
    updateProfile,
    updateAvatar,
    loading,
  } = useUserStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [avatarLoading, setAvatarLoading] =
    useState(false);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [
    transactionsLoading,
    setTransactionsLoading,
  ] = useState(false);

  const [showAllOrders, setShowAllOrders] =
    useState(false);

  /*
   * ==========================================================
   * LOAD PROFILE
   * ==========================================================
   */

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /*
   * ==========================================================
   * LOAD CUSTOMER DATA
   * ==========================================================
   */

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
    });

    fetchOrders();
    fetchTransactions();
  }, [user?._id]);

  /*
   * ==========================================================
   * PHONE NORMALIZATION
   * ==========================================================
   */

  const normalizePhone = (phone) => {
    let value = String(phone || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

    if (value.startsWith("+")) {
      value = value.slice(1);
    }

    if (/^0(7|1)\d{8}$/.test(value)) {
      return `254${value.slice(1)}`;
    }

    if (/^(7|1)\d{8}$/.test(value)) {
      return `254${value}`;
    }

    if (/^254(7|1)\d{8}$/.test(value)) {
      return value;
    }

    return value;
  };

  /*
   * ==========================================================
   * UPDATE PROFILE
   * ==========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Full name is required");
      return;
    }

    const normalizedPhone = normalizePhone(
      form.phone
    );

    if (
      !/^254(7|1)\d{8}$/.test(normalizedPhone)
    ) {
      toast.error(
        "Enter a valid Kenyan phone number"
      );
      return;
    }

    try {
      await updateProfile({
        name,
        phone: normalizedPhone,
      });

      await fetchProfile();

      toast.success(
        "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  /*
   * ==========================================================
   * UPDATE AVATAR
   * ==========================================================
   */

  const handleAvatarChange = async (
    event
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select an image"
      );
      return;
    }

    setAvatarLoading(true);

    try {
      await updateAvatar(file);
      await fetchProfile();

      toast.success(
        "Avatar updated successfully!"
      );
    } catch (error) {
      console.error(
        "AVATAR ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to upload avatar"
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  /*
   * ==========================================================
   * FETCH PAID ORDERS
   * ==========================================================
   *
   * /orders/my-orders should now return:
   *
   * - PAID orders only
   * - populated items.product
   * - item.price snapshot
   * - item.quantity snapshot
   * - item.size snapshot
   * - item.color snapshot
   * - deliveryDetails snapshot
   * - coupon snapshot
   * - mpesaTransaction
   */

  const fetchOrders = async () => {
    setOrdersLoading(true);

    try {
      const response =
        await axiosInstance.get(
          "/orders/my-orders",
          {
            withCredentials: true,
          }
        );

      const fetchedOrders =
        Array.isArray(
          response.data?.orders
        )
          ? response.data.orders
          : [];

      setOrders(fetchedOrders);
    } catch (error) {
      console.error(
        "FAILED TO FETCH ORDERS:",
        error
      );

      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  /*
   * ==========================================================
   * FETCH M-PESA TRANSACTIONS
   * ==========================================================
   */

  const fetchTransactions = async () => {
    setTransactionsLoading(true);

    try {
      const response =
        await axiosInstance.get(
          "/mpesa/my",
          {
            withCredentials: true,
          }
        );

      const data = Array.isArray(
        response.data?.transactions
      )
        ? response.data.transactions
        : [];

      setTransactions(data);
    } catch (error) {
      console.error(
        "FAILED TO FETCH M-PESA TRANSACTIONS:",
        error
      );

      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  /*
   * ==========================================================
   * PROFILE LOADING
   * ==========================================================
   */

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-500" />

          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayedOrders =
    showAllOrders
      ? orders
      : orders.slice(0, 5);

  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div>
          <h1 className="text-2xl font-bold text-emerald-400 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage your account and view your
            purchases.
          </p>
        </div>

        {/* ================================================= */}
        {/* PROFILE CARD */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              {/* AVATAR */}

              <div className="flex shrink-0 flex-col items-center">
                <div className="relative">
                  <img
                    src={
                      user.avatar ||
                      "/default-avatar.png"
                    }
                    alt={
                      user.name ||
                      "Profile"
                    }
                    className="h-28 w-28 rounded-full border-4 border-emerald-500 object-cover shadow-lg sm:h-36 sm:w-36"
                  />

                  <label
                    className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 ${
                      avatarLoading
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    }`}
                    title="Change profile picture"
                  >
                    {avatarLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Camera size={18} />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={
                        avatarLoading
                      }
                      onChange={
                        handleAvatarChange
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="mt-4 max-w-[220px] text-center text-lg font-semibold text-white">
                  {user.name}
                </h2>

                <p className="max-w-[240px] break-all text-center text-sm text-gray-400">
                  {user.email}
                </p>
              </div>

              {/* PROFILE DETAILS */}

              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfo
                  icon={
                    <User size={18} />
                  }
                  label="Full Name"
                  value={
                    user.name ||
                    "Not set"
                  }
                />

                <ProfileInfo
                  icon={
                    <CreditCard
                      size={18}
                    />
                  }
                  label="Email"
                  value={
                    user.email ||
                    "Not set"
                  }
                />

                <ProfileInfo
                  icon={
                    <Phone size={18} />
                  }
                  label="Phone"
                  value={
                    user.phone ||
                    "Not set"
                  }
                />

                <ProfileInfo
                  icon={
                    <Clock size={18} />
                  }
                  label="Registered On"
                  value={
                    user.createdAt
                      ? format(
                          new Date(
                            user.createdAt
                          ),
                          "PPP"
                        )
                      : "Not available"
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* EDIT PROFILE */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl sm:p-7 lg:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-emerald-400">
              Edit Profile
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update your name and phone
              number.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Full Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Full Name"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Phone Number
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      phone:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="0712345678"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ================================================= */}
        {/* CUSTOMER ORDERS */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag
                  size={22}
                  className="text-emerald-400"
                />

                <h2 className="text-xl font-bold text-emerald-400 sm:text-2xl">
                  My Orders
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-400">
                Your successful purchases,
                checkout snapshots and
                delivery details.
              </p>
            </div>

            {orders.length > 5 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllOrders(
                    (current) =>
                      !current
                  )
                }
                className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/10"
              >
                {showAllOrders
                  ? "Show Recent"
                  : `View All (${orders.length})`}
              </button>
            )}
          </div>

          {ordersLoading ? (
            <LoadingState text="Loading your orders..." />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={
                <Package size={30} />
              }
              title="No paid orders yet"
              description="Your successful purchases will appear here."
            />
          ) : (
            <div className="space-y-6">
              {displayedOrders.map(
                (order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    user={user}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* M-PESA PAYMENTS */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Wallet
                size={22}
                className="text-emerald-400"
              />

              <h2 className="text-xl font-bold text-emerald-400 sm:text-2xl">
                My M-PESA Payments
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-400">
              Your M-PESA payment attempts
              and receipts.
            </p>
          </div>

          {transactionsLoading ? (
            <LoadingState text="Loading M-PESA payments..." />
          ) : transactions.length ===
            0 ? (
            <EmptyState
              icon={
                <Wallet size={30} />
              }
              title="No M-PESA payments"
              description="Your M-PESA payment history will appear here."
            />
          ) : (
            <>
              {/* MOBILE */}

              <div className="space-y-3 md:hidden">
                {transactions.map(
                  (transaction) => (
                    <TransactionCard
                      key={
                        transaction._id
                      }
                      transaction={
                        transaction
                      }
                    />
                  )
                )}
              </div>

              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-3 py-3">
                        Receipt
                      </th>

                      <th className="px-3 py-3">
                        Amount
                      </th>

                      <th className="px-3 py-3">
                        Phone
                      </th>

                      <th className="px-3 py-3">
                        Status
                      </th>

                      <th className="px-3 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map(
                      (
                        transaction
                      ) => (
                        <tr
                          key={
                            transaction._id
                          }
                          className="border-b border-gray-800/70 transition hover:bg-gray-800/40"
                        >
                          <td className="px-3 py-4 font-mono text-sm text-gray-300">
                            {transaction.mpesaReceiptNumber ||
                              "—"}
                          </td>

                          <td className="px-3 py-4 font-semibold text-white">
                            {formatCurrency(
                              transaction.amount
                            )}
                          </td>

                          <td className="px-3 py-4 text-sm text-gray-300">
                            {transaction.phoneNumber ||
                              "—"}
                          </td>

                          <td className="px-3 py-4">
                            <TransactionStatusBadge
                              status={
                                transaction.status
                              }
                            />
                          </td>

                          <td className="px-3 py-4 text-sm text-gray-400">
                            {formatDate(
                              transaction.updatedAt ||
                                transaction.createdAt
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
      </div>
    </main>
  );
};

/*
 * ============================================================
 * ORDER CARD
 * ============================================================
 */

const OrderCard = ({
  order,
  user,
}) => {
  const items =
    Array.isArray(order?.items)
      ? order.items
      : [];

  /*
   * ==========================================================
   * DELIVERY SNAPSHOT
   * ==========================================================
   */

  const deliveryDetails =
    order?.deliveryDetails || {};

  const deliveryLocation =
    String(
      deliveryDetails.location ||
        ""
    ).trim() ||
    "Not provided";

  /*
   * The actual delivery phone stored
   * on the order has priority.
   */

  const deliveryPhone =
    String(
      deliveryDetails.phoneNumber ||
        ""
    ).trim() ||
    order?.mpesaTransaction
      ?.phoneNumber ||
    user?.phone ||
    "Not provided";

  const deliveryFee = Number(
    deliveryDetails.deliveryFee ||
      0
  );

  /*
   * ==========================================================
   * ORDER PRICE SNAPSHOTS
   * ==========================================================
   */

  const subtotal = Number(
    order?.subtotal || 0
  );

  const discount = Number(
    order?.discountAmount || 0
  );

  const total = Number(
    order?.totalAmount || 0
  );

  /*
   * ==========================================================
   * PAYMENT SNAPSHOT
   * ==========================================================
   */

  const receipt =
    order?.mpesaReceiptNumber ||
    order?.mpesaTransaction
      ?.mpesaReceiptNumber ||
    "Not available";

  const couponCode =
    order?.coupon?.code ||
    order?.coupon?.couponId
      ?.code ||
    null;

  const discountPercentage =
    Number(
      order?.coupon
        ?.discountPercentage ||
        order?.coupon?.couponId
          ?.discountPercentage ||
        0
    );

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/40">
      {/* ================================================= */}
      {/* ORDER HEADER */}
      {/* ================================================= */}

      <div className="border-b border-gray-700 bg-gray-800/70 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2
                  size={13}
                />
                PAID
              </span>

              <span className="rounded-full border border-gray-700 bg-gray-900/50 px-2.5 py-1 text-xs text-gray-400">
                {order?.paymentMethod ||
                  "MPESA"}
              </span>
            </div>

            <p className="mt-3 break-all font-mono text-xs text-gray-400 sm:text-sm">
              Order #{order?._id}
            </p>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {formatDate(
                order?.paidAt ||
                  order?.createdAt
              )}
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Paid
            </p>

            <p className="mt-1 text-xl font-bold text-emerald-400 sm:text-2xl">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* PRODUCTS */}
      {/* ================================================= */}

      <div className="p-4 sm:p-5">
        <div className="mb-1 flex items-center gap-2">
          <Package
            size={18}
            className="text-emerald-400"
          />

          <h3 className="font-semibold text-white">
            Purchased Products
          </h3>
        </div>

        <p className="mb-4 text-xs text-gray-500">
          Size, color, quantity and price
          below are the values saved when
          this order was placed.
        </p>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Product details are not
            available.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map(
              (item, index) => (
                <OrderProduct
                  key={
                    item?._id ||
                    `${
                      item?.product
                        ?._id ||
                      "product"
                    }-${index}`
                  }
                  item={item}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* DELIVERY + PAYMENT */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 border-t border-gray-700 lg:grid-cols-2">
        {/* DELIVERY SNAPSHOT */}

        <div className="border-b border-gray-700 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-1 flex items-center gap-2">
            <Truck
              size={18}
              className="text-emerald-400"
            />

            <h3 className="font-semibold text-white">
              Delivery Details
            </h3>
          </div>

          <p className="mb-5 text-xs text-gray-500">
            Saved at checkout
          </p>

          <div className="space-y-4">
            <DetailRow
              icon={
                <MapPin size={17} />
              }
              label="Delivery Location"
              value={
                deliveryLocation
              }
            />

            <DetailRow
              icon={
                <Phone size={17} />
              }
              label="Delivery Phone"
              value={
                deliveryPhone
              }
            />

            <DetailRow
              icon={
                <Truck size={17} />
              }
              label="Delivery Fee"
              value={formatCurrency(
                deliveryFee
              )}
            />
          </div>
        </div>

        {/* PAYMENT SNAPSHOT */}

        <div className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2">
            <ReceiptText
              size={18}
              className="text-emerald-400"
            />

            <h3 className="font-semibold text-white">
              Payment Summary
            </h3>
          </div>

          <p className="mb-5 text-xs text-gray-500">
            Amounts saved on this order
          </p>

          <div className="space-y-3 text-sm">
            <PaymentRow
              label="Subtotal"
              value={formatCurrency(
                subtotal
              )}
            />

            {couponCode && (
              <PaymentRow
                label="Coupon"
                value={
                  discountPercentage >
                  0
                    ? `${couponCode} (${discountPercentage}%)`
                    : couponCode
                }
                highlight
              />
            )}

            <PaymentRow
              label="Discount"
              value={
                discount > 0
                  ? `- ${formatCurrency(
                      discount
                    )}`
                  : formatCurrency(0)
              }
              highlight={
                discount > 0
              }
            />

            <PaymentRow
              label="Delivery Fee"
              value={formatCurrency(
                deliveryFee
              )}
            />

            <div className="my-2 border-t border-gray-700" />

            <PaymentRow
              label="Total Paid"
              value={formatCurrency(
                total
              )}
              total
            />

            {/* M-PESA RECEIPT */}

            <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900/60 p-3">
              <p className="text-xs text-gray-500">
                M-PESA Receipt
              </p>

              <div className="mt-1 flex items-center gap-2">
                <ReceiptText
                  size={15}
                  className="shrink-0 text-emerald-400"
                />

                <p className="break-all font-mono text-sm font-semibold text-gray-200">
                  {receipt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

/*
 * ============================================================
 * ORDER PRODUCT
 * ============================================================
 *
 * This component deliberately separates:
 *
 * CURRENT PRODUCT METADATA
 *   - name
 *   - image
 *
 * from:
 *
 * PURCHASE SNAPSHOTS
 *   - item.price
 *   - item.quantity
 *   - item.size
 *   - item.color
 *
 * Never replace these historical values with
 * product.price/product.sizes/product.colors.
 * ============================================================
 */

const OrderProduct = ({ item }) => {
  const product =
    item?.product || {};

  /*
   * ==========================================================
   * CURRENT PRODUCT METADATA
   * ==========================================================
   */

  const image =
    getProductImage(product);

  const name =
    product?.name ||
    "Product";

  /*
   * ==========================================================
   * CHECKOUT SNAPSHOTS
   * ==========================================================
   */

  const snapshotPrice =
    Number(item?.price || 0);

  const snapshotQuantity =
    Math.max(
      1,
      Number(
        item?.quantity || 1
      )
    );

  const snapshotSize =
    String(
      item?.size || ""
    ).trim();

  const snapshotColor =
    String(
      item?.color || ""
    ).trim();

  const snapshotLineTotal =
    snapshotPrice *
    snapshotQuantity;

  return (
    <div className="rounded-xl border border-gray-700/70 bg-gray-900/50 p-3 sm:p-4">
      {/* ================================================= */}
      {/* PRODUCT IDENTITY */}
      {/* ================================================= */}

      <div className="flex gap-3 sm:gap-4">
        {/* IMAGE */}

        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 sm:h-24 sm:w-24">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-600">
              <Package size={28} />
            </div>
          )}
        </div>

        {/* NAME */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-white">
                {name}
              </p>

              {product?.category && (
                <p className="mt-1 text-xs capitalize text-gray-500">
                  {product.category}
                </p>
              )}
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-xs text-gray-500">
                Item Total
              </p>

              <p className="font-bold text-emerald-400">
                {formatCurrency(
                  snapshotLineTotal
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* PURCHASE SNAPSHOT */}
      {/* ================================================= */}

      <div className="mt-4 rounded-xl border border-emerald-500/10 bg-gray-800/70 p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2">
          <ReceiptText
            size={15}
            className="text-emerald-400"
          />

          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Purchase Snapshot
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* SIZE SNAPSHOT */}

          <SnapshotValue
            label="Size"
            value={
              snapshotSize ||
              "N/A"
            }
          />

          {/* COLOR SNAPSHOT */}

          <SnapshotValue
            label="Color"
            value={
              snapshotColor ||
              "N/A"
            }
          />

          {/* QUANTITY SNAPSHOT */}

          <SnapshotValue
            label="Quantity"
            value={
              snapshotQuantity
            }
          />

          {/* PRICE SNAPSHOT */}

          <SnapshotValue
            label="Unit Price"
            value={formatCurrency(
              snapshotPrice
            )}
          />
        </div>

        {/* LINE TOTAL */}

        <div className="mt-3 flex flex-col gap-2 border-t border-gray-700 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500">
              Price at time of purchase
            </p>

            <p className="mt-1 text-sm text-gray-300">
              {formatCurrency(
                snapshotPrice
              )}{" "}
              × {snapshotQuantity}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-gray-500">
              Line Total
            </p>

            <p className="text-lg font-bold text-emerald-400">
              {formatCurrency(
                snapshotLineTotal
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
 * ============================================================
 * SNAPSHOT VALUE
 * ============================================================
 */

const SnapshotValue = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0 rounded-lg border border-gray-800 bg-gray-900/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
};

/*
 * ============================================================
 * PROFILE INFO
 * ============================================================
 */

const ProfileInfo = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-emerald-400">
          {icon}
        </span>

        <p className="text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words font-semibold text-white">
        {value}
      </p>
    </div>
  );
};

/*
 * ============================================================
 * DETAIL ROW
 * ============================================================
 */

const DetailRow = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-emerald-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );
};

/*
 * ============================================================
 * PAYMENT ROW
 * ============================================================
 */

const PaymentRow = ({
  label,
  value,
  highlight = false,
  total = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        total
          ? "text-base font-bold"
          : ""
      }`}
    >
      <span
        className={
          total
            ? "text-white"
            : "text-gray-400"
        }
      >
        {label}
      </span>

      <span
        className={
          total || highlight
            ? "font-semibold text-emerald-400"
            : "font-medium text-gray-200"
        }
      >
        {value}
      </span>
    </div>
  );
};

/*
 * ============================================================
 * MOBILE TRANSACTION CARD
 * ============================================================
 */

const TransactionCard = ({
  transaction,
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">
            Amount
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {formatCurrency(
              transaction.amount
            )}
          </p>
        </div>

        <TransactionStatusBadge
          status={
            transaction.status
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-700 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">
            Receipt
          </p>

          <p className="mt-1 break-all font-mono text-sm text-gray-300">
            {transaction.mpesaReceiptNumber ||
              "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Phone
          </p>

          <p className="mt-1 text-sm text-gray-300">
            {transaction.phoneNumber ||
              "—"}
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs text-gray-500">
            Date
          </p>

          <p className="mt-1 text-sm text-gray-300">
            {formatDate(
              transaction.updatedAt ||
                transaction.createdAt
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

/*
 * ============================================================
 * LOADING STATE
 * ============================================================
 */

const LoadingState = ({
  text,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-500" />

      <p className="mt-3 text-sm text-gray-400">
        {text}
      </p>
    </div>
  );
};

/*
 * ============================================================
 * EMPTY STATE
 * ============================================================
 */

const EmptyState = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/40 px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-emerald-400">
        {icon}
      </div>

      <p className="mt-4 font-semibold text-gray-200">
        {title}
      </p>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default ProfilePage;