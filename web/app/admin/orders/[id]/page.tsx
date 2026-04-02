"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminApiCall } from "../../../../lib/adminAuth";
import type { AdminOrder } from "../../../../lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-gray-500/20 text-gray-400",
  paid: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await adminApiCall<{ order: AdminOrder }>(
          "GET",
          `/admin/orders/${id}`
        );
        setOrder(data.order);
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">Loading order...</div>
    );
  }

  if (!order) {
    return (
      <div className="text-gray-500 text-center py-12">Order not found</div>
    );
  }

  const user = typeof order.userId === "object" ? order.userId : null;
  const shop = typeof order.shopId === "object" ? order.shopId : null;

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/admin/orders")}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        &larr; Back to orders
      </button>

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white font-mono">
            #{order._id.slice(-8)}
          </h3>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              STATUS_COLORS[order.status] || "bg-gray-500/20 text-gray-400"
            }`}
          >
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 mb-1">User</p>
              <p className="text-white">
                {user ? (
                  <span>
                    {user.username}
                    {user.phone && (
                      <span className="text-gray-500 ml-2">{user.phone}</span>
                    )}
                  </span>
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Shop</p>
              <p className="text-white">{shop ? shop.name : "-"}</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-500 mb-2">Items</p>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between bg-[#060b18] rounded-lg px-4 py-2"
                  >
                    <span className="text-gray-300">
                      {item.item}{" "}
                      <span className="text-gray-500">({item.size})</span>
                    </span>
                    <span className="text-gray-300">
                      {"\u20B9"}
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between bg-[#060b18] rounded-lg px-4 py-2">
                <span className="text-gray-300">
                  {order.item}{" "}
                  <span className="text-gray-500">({order.size})</span>
                </span>
                <span className="text-gray-300">
                  {"\u20B9"}
                  {order.price}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 flex justify-between">
            <span className="text-gray-400 font-medium">Total</span>
            <span className="text-white font-bold text-lg">
              {"\u20B9"}
              {order.totalPrice || order.price}
            </span>
          </div>

          {order.eta && (
            <div className="flex justify-between">
              <span className="text-gray-500">ETA</span>
              <span className="text-gray-300">{order.eta} min</span>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 mb-1">Payment ID</p>
              <p className="text-gray-300 font-mono text-xs">
                {order.razorpay_payment_id || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Refund Status</p>
              <p className="text-gray-300">
                {order.refund_status || "none"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 mb-1">Created</p>
              <p className="text-gray-300">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Updated</p>
              <p className="text-gray-300">
                {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
