"use client";

import { useEffect, useState } from "react";
import { shopApiCall, getShopInfo } from "../../../lib/shopAuth";

export default function SettingsPage() {
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const shopInfo = getShopInfo();

  useEffect(() => {
    async function fetchShop() {
      try {
        // Use the menu endpoint to verify connectivity; status comes from a dedicated endpoint
        // We'll fetch the current status by checking orders endpoint or add a shop info endpoint
        // For now, we rely on the shop info from the stats or a simple check
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    fetchShop();
  }, []);

  const handleToggle = async (newStatus: "active" | "inactive") => {
    setUpdating(true);
    try {
      await shopApiCall("PATCH", "/shop-dashboard/status", {
        status: newStatus,
      });
      setStatus(newStatus);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">Loading settings...</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {shopInfo && (
        <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Shop Info</h3>
          <p className="text-white font-medium text-lg">{shopInfo.name}</p>
          <p className="text-gray-500 text-sm mt-1">Slug: {shopInfo.slug}</p>
        </div>
      )}

      <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Shop Availability
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          When inactive, your shop will not appear in nearby shop searches.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleToggle("active")}
            disabled={updating}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleToggle("inactive")}
            disabled={updating}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === "inactive"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>
    </div>
  );
}
