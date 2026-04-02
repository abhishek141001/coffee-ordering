"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiCall } from "../../../lib/adminAuth";
import type { AdminOrder } from "../../../lib/types";

interface ShopSettlement {
  shopId: string;
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  totalCollected: number;
  orderCount: number;
}

interface RefundStats {
  none: { count: number; total: number };
  processed: { count: number; total: number };
  failed: { count: number; total: number };
}

interface SettlementsData {
  shopSettlements: ShopSettlement[];
  refundStats: RefundStats;
  pendingOrdersCount: number;
}

type Tab = "settlements" | "pending" | "failed";

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<Tab>("settlements");
  const [settlements, setSettlements] = useState<SettlementsData | null>(null);
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [failedOrders, setFailedOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    if (tab === "settlements") {
      adminApiCall<SettlementsData>("GET", "/admin/settlements")
        .then(setSettlements)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === "pending") {
      adminApiCall<{ orders: AdminOrder[]; total: number }>(
        "GET",
        `/admin/payments/pending?page=${page}&limit=20`
      )
        .then((data) => {
          setPendingOrders(data.orders);
          setPendingTotal(data.total);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      adminApiCall<{ orders: AdminOrder[] }>("GET", "/admin/payments/failed-refunds")
        .then((data) => setFailedOrders(data.orders))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, page]);

  const handleRefund = async (orderId: string) => {
    if (!confirm("Process refund for this order?")) return;
    setRefundingId(orderId);
    try {
      const data = await adminApiCall<{ message: string; amount: number }>(
        "POST",
        `/admin/orders/${orderId}/refund`
      );
      alert(`${data.message} (\u20B9${data.amount})`);
      // Refresh current tab
      if (tab === "pending") {
        setPendingOrders((prev) => prev.filter((o) => o._id !== orderId));
        setPendingTotal((t) => t - 1);
      } else if (tab === "failed") {
        setFailedOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setRefundingId(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "settlements", label: "Settlements" },
    { key: "pending", label: "Paid & Unactioned" },
    { key: "failed", label: "Failed Refunds" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-800 pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? "bg-amber-600/20 text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : tab === "settlements" && settlements ? (
        <div className="space-y-6">
          {/* Refund summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400">Paid & Unactioned</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {settlements.pendingOrdersCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Orders paid but not accepted/rejected
              </p>
            </div>
            <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400">Refunds Pending</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {settlements.refundStats.none.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {"\u20B9"}
                {settlements.refundStats.none.total} to refund
              </p>
            </div>
            <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400">Refunds Processed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {settlements.refundStats.processed.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {"\u20B9"}
                {settlements.refundStats.processed.total} refunded
              </p>
            </div>
            <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400">Refunds Failed</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {settlements.refundStats.failed.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {"\u20B9"}
                {settlements.refundStats.failed.total} need retry
              </p>
            </div>
          </div>

          {/* Per-shop settlement table */}
          <h3 className="text-white font-semibold">Per-Shop Collections</h3>
          {settlements.shopSettlements.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No accepted orders yet
            </div>
          ) : (
            <div className="bg-[#0a1628] border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                        Shop
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                        Owner
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                        Orders
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                        Total Collected
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.shopSettlements.map((s) => (
                      <tr
                        key={s.shopId}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/shops/${s.shopId}`}
                            className="text-white hover:text-amber-500 font-medium"
                          >
                            {s.shopName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300 text-sm">{s.ownerName}</p>
                          <p className="text-gray-500 text-xs">{s.ownerEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {s.orderCount}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-semibold">
                          {"\u20B9"}
                          {s.totalCollected}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : tab === "pending" ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Orders where payment was collected but shop hasn&apos;t
            accepted/rejected. You can refund these to the customer.
          </p>
          {pendingOrders.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              No pending orders
            </div>
          ) : (
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
                      <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                        Paid At
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => {
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
                          <td className="px-6 py-4 text-right text-white">
                            {"\u20B9"}
                            {order.totalPrice || order.price}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(order.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRefund(order._id)}
                              disabled={refundingId === order._id}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            >
                              {refundingId === order._id
                                ? "Processing..."
                                : "Refund"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {Math.ceil(pendingTotal / 20) > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                {page} / {Math.ceil(pendingTotal / 20)}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(pendingTotal / 20), p + 1))
                }
                disabled={page === Math.ceil(pendingTotal / 20)}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : tab === "failed" ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Orders that were rejected but the Razorpay refund failed. Retry the
            refund below.
          </p>
          {failedOrders.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              No failed refunds
            </div>
          ) : (
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
                      <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedOrders.map((order) => {
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
                          <td className="px-6 py-4 text-right text-white">
                            {"\u20B9"}
                            {order.totalPrice || order.price}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRefund(order._id)}
                              disabled={refundingId === order._id}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                            >
                              {refundingId === order._id
                                ? "Retrying..."
                                : "Retry Refund"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
