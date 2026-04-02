"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiCall } from "../../../lib/adminAuth";
import type { AdminOrder } from "../../../lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-gray-500/20 text-gray-400",
  paid: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (status !== "all") params.set("status", status);

        const data = await adminApiCall<{
          orders: AdminOrder[];
          total: number;
        }>("GET", `/admin/orders?${params}`);
        setOrders(data.orders);
        setTotal(data.total);
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page, status]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
      >
        <option value="all">All Status</option>
        <option value="pending_payment">Pending Payment</option>
        <option value="paid">Paid</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? (
        <div className="text-gray-500 text-center py-12">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No orders found</div>
      ) : (
        <>
          <div className="bg-[#0a1628] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Order
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Shop
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const user =
                      typeof order.userId === "object" ? order.userId : null;
                    const shop =
                      typeof order.shopId === "object" ? order.shopId : null;
                    return (
                      <tr
                        key={order._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="text-white hover:text-amber-500 font-mono text-sm"
                          >
                            #{order._id.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {user ? user.username : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {shop ? shop.name : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {"\u20B9"}
                          {order.totalPrice || order.price}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              STATUS_COLORS[order.status] ||
                              "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
