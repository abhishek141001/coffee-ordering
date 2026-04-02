"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiCall } from "../../../lib/adminAuth";
import type { AdminUser } from "../../../lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search) params.set("search", search);

        const data = await adminApiCall<{ users: AdminUser[]; total: number }>(
          "GET",
          `/admin/users?${params}`
        );
        setUsers(data.users);
        setTotal(data.total);
      } catch {
        // auth redirect handled
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full sm:max-w-md px-4 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
      />

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No users found</div>
      ) : (
        <>
          <div className="bg-[#0a1628] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Username
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Phone
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-white hover:text-amber-500 font-medium"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
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
