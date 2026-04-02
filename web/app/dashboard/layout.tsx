"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getShopToken, getShopInfo, clearShopToken } from "../../lib/shopAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Orders", icon: "📋" },
  { href: "/dashboard/menu", label: "Menu", icon: "☕" },
  { href: "/dashboard/stats", label: "Stats", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [shopName, setShopName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage =
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/setup-password";

  useEffect(() => {
    if (isAuthPage) return;
    const token = getShopToken();
    if (!token) {
      router.push("/dashboard/login");
      return;
    }
    const info = getShopInfo();
    if (info) setShopName(info.name);
  }, [isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;

  const handleLogout = () => {
    clearShopToken();
    router.push("/dashboard/login");
  };

  return (
    <div className="flex h-screen bg-[#060b18]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0a1628] border-r border-gray-800 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-amber-500">
            Terminal Coffee
          </h1>
          {shopName && (
            <p className="text-sm text-gray-400 mt-1 truncate">{shopName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/orders")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-600/20 text-amber-500"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center px-6 lg:px-8 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-white">
            {NAV_ITEMS.find((item) =>
              item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/orders")
                : pathname.startsWith(item.href)
            )?.label || "Dashboard"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
