"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { shopApiCall } from "../../lib/shopAuth";
import type { Order } from "../../lib/types";

type Tab = "pending" | "history";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  pending_payment: "bg-yellow-500/20 text-yellow-400",
};

function OrderCard({
  order,
  onAccept,
  onReject,
}: {
  order: Order;
  onAccept: (id: string, eta: number) => void;
  onReject: (id: string) => void;
}) {
  const [selectedEta, setSelectedEta] = useState(10);
  const [acting, setActing] = useState(false);
  const user =
    typeof order.userId === "object" ? order.userId : { username: "Unknown" };
  const items =
    order.items && order.items.length > 0
      ? order.items
      : order.item
        ? [{ item: order.item, size: order.size || "", price: order.price || 0 }]
        : [];

  return (
    <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/dashboard/orders/${order._id}`}
            className="text-sm font-mono text-gray-500 hover:text-amber-500 transition-colors"
          >
            #{order._id.slice(-8)}
          </Link>
          <p className="text-white font-medium mt-1">{user.username}</p>
          {"phone" in user && user.phone && (
            <p className="text-gray-500 text-sm">{user.phone}</p>
          )}
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[order.status] || ""}`}
          >
            {order.status.replace("_", " ")}
          </span>
          <p className="text-gray-500 text-xs mt-1">{timeAgo(order.createdAt)}</p>
        </div>
      </div>

      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {cap(item.item)} ({cap(item.size)})
            </span>
            <span className="text-gray-400">&#8377;{item.price}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-800">
          <span className="text-white">Total</span>
          <span className="text-amber-500">&#8377;{order.totalPrice}</span>
        </div>
      </div>

      {order.status === "paid" && (
        <div className="flex items-center gap-3 pt-2">
          <select
            value={selectedEta}
            onChange={(e) => setSelectedEta(Number(e.target.value))}
            className="bg-[#060b18] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
          </select>
          <button
            onClick={async () => {
              setActing(true);
              await onAccept(order._id, selectedEta);
              setActing(false);
            }}
            disabled={acting}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            onClick={async () => {
              setActing(true);
              await onReject(order._id);
              setActing(false);
            }}
            disabled={acting}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {order.status === "accepted" && order.eta && (
        <p className="text-sm text-green-400">ETA: {order.eta} minutes</p>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const status = tab === "pending" ? "paid" : "all";
      const data = await shopApiCall<{
        orders: Order[];
        total: number;
      }>("GET", `/shop-dashboard/orders?status=${status}&page=${page}&limit=20`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      // auth redirect handled by shopApiCall
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
  }, [tab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh pending orders every 10 seconds
  useEffect(() => {
    if (tab !== "pending") return;
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [tab, fetchOrders]);

  const handleAccept = async (orderId: string, eta: number) => {
    try {
      await shopApiCall("POST", `/shop-dashboard/orders/${orderId}/accept`, {
        eta,
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept order");
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await shopApiCall("POST", `/shop-dashboard/orders/${orderId}/reject`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject order");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#0a1628] rounded-lg p-1 w-fit">
        {(["pending", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-amber-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "pending" ? "Pending" : "History"}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          {tab === "pending"
            ? "No pending orders right now"
            : "No order history yet"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
