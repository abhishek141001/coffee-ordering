"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { adminApiCall } from "../../../../lib/adminAuth";
import type { AdminUser, Order } from "../../../../lib/types";

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, ordersData] = await Promise.all([
          adminApiCall<{ user: AdminUser; orderCount: number }>(
            "GET",
            `/admin/users/${id}`
          ),
          adminApiCall<{ orders: Order[] }>(
            "GET",
            `/admin/orders?limit=10&userId=${id}`
          ).catch(() => ({ orders: [] })),
        ]);
        setUser(userData.user);
        setOrderCount(userData.orderCount);
        setOrders(ordersData.orders);
        setUsername(userData.user.username);
        setPhone(userData.user.phone || "");
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const data = await adminApiCall<{ message: string; user: AdminUser }>(
        "PUT",
        `/admin/users/${id}`,
        { username, phone }
      );
      setUser(data.user);
      setMessage("User updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(true);
    try {
      await adminApiCall("DELETE", `/admin/users/${id}`);
      router.push("/admin/users");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">Loading user...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-gray-500 text-center py-12">User not found</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/admin/users")}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        &larr; Back to users
      </button>

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">User Details</h3>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <span className="text-gray-500">Joined:</span>{" "}
          {new Date(user.createdAt).toLocaleDateString()} |{" "}
          <span className="text-gray-500">Orders:</span> {orderCount}
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("success") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {orders.length > 0 && (
        <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="block bg-[#060b18] border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-mono">
                    #{order._id.slice(-8)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "accepted"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : order.status === "paid"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500 text-xs">
                    {order.item}
                    {order.items && order.items.length > 1
                      ? ` + ${order.items.length - 1} more`
                      : ""}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {"\u20B9"}
                    {order.totalPrice || order.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0a1628] border border-red-500/30 rounded-xl p-6">
        <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
        <p className="text-gray-500 text-sm mb-4">
          This action cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {deleting ? "Deleting..." : "Delete User"}
        </button>
      </div>
    </div>
  );
}
