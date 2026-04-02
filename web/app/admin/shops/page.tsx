"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiCall } from "../../../lib/adminAuth";
import type { Shop } from "../../../lib/types";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-red-500/20 text-red-400",
  pending: "bg-yellow-500/20 text-yellow-400",
};

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const limit = 20;

  async function fetchShops() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);

      const data = await adminApiCall<{ shops: Shop[]; total: number }>(
        "GET",
        `/admin/shops?${params}`
      );
      setShops(data.shops);
      setTotal(data.total);
    } catch {
      // auth redirect handled
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShops();
  }, [page, search, status]);

  const toggleStatus = async (shop: Shop) => {
    const newStatus = shop.status === "active" ? "inactive" : "active";
    setTogglingId(shop._id);
    try {
      await adminApiCall("PUT", `/admin/shops/${shop._id}`, {
        status: newStatus,
      });
      setShops((prev) =>
        prev.map((s) => (s._id === shop._id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search shops..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading shops...</div>
      ) : shops.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No shops found</div>
      ) : (
        <>
          <div className="bg-[#0a1628] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Owner
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Created
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr
                      key={shop._id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/shops/${shop._id}`}
                          className="text-white hover:text-amber-500 font-medium"
                        >
                          {shop.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {shop.slug}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">
                          {shop.owner?.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {shop.owner?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_COLORS[shop.status] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {shop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(
                          (shop as Shop & { createdAt?: string }).createdAt || ""
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(shop)}
                          disabled={togglingId === shop._id}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            shop.status === "active"
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          {togglingId === shop._id
                            ? "..."
                            : shop.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
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
