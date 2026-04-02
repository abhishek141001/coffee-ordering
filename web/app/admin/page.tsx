"use client";

import { useEffect, useState } from "react";
import { adminApiCall } from "../../lib/adminAuth";
import type { PlatformStats } from "../../lib/types";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#0a1628] border border-gray-800 rounded-xl p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminApiCall<PlatformStats>("GET", "/admin/stats");
        setStats(data);
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">Loading stats...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-500 text-center py-12">
        Failed to load stats
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Shops" value={String(stats.totalShops)} />
        <StatCard
          label="Active Shops"
          value={String(stats.activeShops)}
          sub={`${stats.inactiveShops} inactive, ${stats.pendingShops} pending`}
        />
        <StatCard label="Total Users" value={String(stats.totalUsers)} />
        <StatCard
          label="Orders Today"
          value={String(stats.ordersToday)}
        />
        <StatCard
          label="Revenue Today"
          value={`\u20B9${stats.revenueToday}`}
        />
        <StatCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          sub="All time"
        />
        <StatCard
          label="Total Revenue"
          value={`\u20B9${stats.totalRevenue}`}
          sub="All time"
        />
      </div>
    </div>
  );
}
