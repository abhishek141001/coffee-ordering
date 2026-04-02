"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminApiCall } from "../../../../lib/adminAuth";
import type { Shop } from "../../../../lib/types";

export default function AdminShopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    async function fetchShop() {
      try {
        const data = await adminApiCall<{ shop: Shop; orderCount: number }>(
          "GET",
          `/admin/shops/${id}`
        );
        setShop(data.shop);
        setOrderCount(data.orderCount);
        setName(data.shop.name);
        setStatus(data.shop.status);
        setOpenTime(data.shop.operatingHours?.open || "08:00");
        setCloseTime(data.shop.operatingHours?.close || "22:00");
        setTelegramChatId(data.shop.telegramChatId || "");
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const data = await adminApiCall<{ message: string; shop: Shop }>(
        "PUT",
        `/admin/shops/${id}`,
        {
          name,
          status,
          operatingHours: { open: openTime, close: closeTime },
          telegramChatId,
        }
      );
      setShop(data.shop);
      setMessage("Shop updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete the shop and all its orders."))
      return;
    setDeleting(true);
    try {
      await adminApiCall("DELETE", `/admin/shops/${id}`);
      router.push("/admin/shops");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">Loading shop...</div>
    );
  }

  if (!shop) {
    return (
      <div className="text-gray-500 text-center py-12">Shop not found</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/admin/shops")}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        &larr; Back to shops
      </button>

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Shop Details</h3>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Open Time
              </label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Close Time
              </label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
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

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Info</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            <span className="text-gray-500">Slug:</span>{" "}
            <span className="font-mono">{shop.slug}</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Owner:</span> {shop.owner?.name} (
            {shop.owner?.email})
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Location:</span>{" "}
            {shop.location?.address || "Not set"}
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Menu Items:</span>{" "}
            {shop.menu?.length || 0}
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Total Orders:</span> {orderCount}
          </p>
        </div>
      </div>

      <div className="bg-[#0a1628] border border-red-500/30 rounded-xl p-6">
        <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
        <p className="text-gray-500 text-sm mb-4">
          Deleting a shop will also delete all its associated orders. This
          action cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {deleting ? "Deleting..." : "Delete Shop"}
        </button>
      </div>
    </div>
  );
}
