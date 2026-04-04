"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { shopApiCall, getShopToken, setShopToken, setShopInfo } from "../../../../lib/shopAuth";
import { apiCall } from "../../../../lib/api";
import type { Order } from "../../../../lib/types";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  pending_payment: "bg-yellow-500/20 text-yellow-400",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEta, setSelectedEta] = useState(10);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function init() {
      // Exchange one-time token if present
      const ott = searchParams.get("ott");
      if (ott) {
        try {
          const data = await apiCall<{
            token: string;
            shop: { id: string; name: string; slug: string };
          }>("POST", "/shop-auth/exchange-ott", { token: ott });
          setShopToken(data.token);
          setShopInfo(data.shop);
        } catch {
          // OTT expired or invalid — fall through to normal auth
        }
        // Remove ott from URL without reload
        router.replace(`/dashboard/orders/${orderId}`);
      }

      // Fetch order
      try {
        const data = await shopApiCall<{ order: Order }>(
          "GET",
          `/shop-dashboard/orders/${orderId}`
        );
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [orderId, searchParams, router]);

  const handleAccept = async () => {
    setActing(true);
    try {
      await shopApiCall("POST", `/shop-dashboard/orders/${orderId}/accept`, {
        eta: selectedEta,
      });
      setOrder((prev) =>
        prev ? { ...prev, status: "accepted", eta: selectedEta } : prev
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await shopApiCall("POST", `/shop-dashboard/orders/${orderId}/reject`);
      setOrder((prev) => (prev ? { ...prev, status: "rejected" } : prev));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || "Order not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-amber-500 hover:text-amber-400 text-sm"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const user =
    typeof order.userId === "object" ? order.userId : { username: "Unknown" };
  const items =
    order.items && order.items.length > 0
      ? order.items
      : order.item
        ? [{ item: order.item, size: order.size || "", price: order.price || 0 }]
        : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
      >
        &larr; Back to orders
      </button>

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-mono text-gray-500">
              Order #{order._id.slice(-8)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-block px-3 py-1 rounded text-sm font-medium ${STATUS_STYLES[order.status] || ""}`}
          >
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Customer</h3>
          <p className="text-white">{user.username}</p>
          {"phone" in user && user.phone && (
            <a href={`tel:${user.phone}`} className="text-amber-500 hover:text-amber-400 text-sm block">
              {user.phone}
            </a>
          )}
          {order.userLocation && (
            <>
              <a
                href={`https://www.google.com/maps?q=${order.userLocation.lat},${order.userLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1 mt-2"
              >
                View customer location on Maps
              </a>
              {order.userLocation.address && (
                <p className="text-zinc-300 text-sm mt-1">
                  🏠 {order.userLocation.address}
                </p>
              )}
            </>
          )}
        </div>

        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Items</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-300">
                  {cap(item.item)} ({cap(item.size)})
                </span>
                <span className="text-gray-400">&#8377;{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between font-medium pt-2 border-t border-gray-800">
              <span className="text-white">Total</span>
              <span className="text-amber-500">&#8377;{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {order.status === "accepted" && order.eta && (
          <div className="border-t border-gray-800 pt-4">
            <p className="text-green-400">ETA: {order.eta} minutes</p>
          </div>
        )}

        {order.refund_status && order.refund_status !== "none" && (
          <div className="border-t border-gray-800 pt-4">
            <p
              className={
                order.refund_status === "processed"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              Refund: {order.refund_status}
            </p>
          </div>
        )}

        {order.status === "paid" && (
          <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
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
              onClick={handleAccept}
              disabled={acting}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              Accept Order
            </button>
            <button
              onClick={handleReject}
              disabled={acting}
              className="py-2 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
