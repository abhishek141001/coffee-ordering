"use client";

import { useEffect, useState } from "react";
import { shopApiCall } from "../../../lib/shopAuth";
import type { MenuItem } from "../../../lib/types";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBasePrice, setFormBasePrice] = useState("");

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      const data = await shopApiCall<{ menu: MenuItem[] }>(
        "GET",
        "/shop-dashboard/menu"
      );
      setMenu(data.menu);
    } catch {
      // auth redirect handled
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormName("");
    setFormDescription("");
    setFormBasePrice("");
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item._id || null);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormBasePrice(String(item.basePrice));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name: formName,
      description: formDescription,
      basePrice: Number(formBasePrice),
    };

    try {
      if (editingId) {
        await shopApiCall("PUT", `/shop-dashboard/menu/${editingId}`, body);
      } else {
        await shopApiCall("POST", "/shop-dashboard/menu", body);
      }
      resetForm();
      fetchMenu();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save item");
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this menu item?")) return;
    try {
      await shopApiCall("DELETE", `/shop-dashboard/menu/${itemId}`);
      setMenu((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  async function handleToggle(itemId: string, available: boolean) {
    try {
      await shopApiCall(
        "PATCH",
        `/shop-dashboard/menu/${itemId}/availability`,
        { available }
      );
      setMenu((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, available } : i))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{menu.length} items</p>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0a1628] border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-white font-medium">
            {editingId ? "Edit Item" : "New Menu Item"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="e.g. Cappuccino"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Base Price (&#8377;)
              </label>
              <input
                type="number"
                value={formBasePrice}
                onChange={(e) => setFormBasePrice(e.target.value)}
                required
                min={1}
                className="w-full px-3 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="200"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description
              </label>
              <input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#060b18] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Optional"
              />
            </div>
          </div>
          {formBasePrice && (
            <p className="text-xs text-gray-500">
              Auto-calculated sizes: Small &#8377;
              {Math.round(Number(formBasePrice) * 0.8)}, Medium &#8377;
              {Number(formBasePrice)}, Large &#8377;
              {Math.round(Number(formBasePrice) * 1.2)}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Menu Items */}
      {menu.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          No menu items yet. Add your first item above.
        </div>
      ) : (
        <div className="space-y-3">
          {menu.map((item) => (
            <div
              key={item._id || item.name}
              className={`bg-[#0a1628] border border-gray-800 rounded-xl p-5 flex items-center gap-4 ${
                item.available === false ? "opacity-50" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{cap(item.name)}</h4>
                  {item.available === false && (
                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>S: &#8377;{item.sizes.small.price}</span>
                  <span>M: &#8377;{item.sizes.medium.price}</span>
                  <span>L: &#8377;{item.sizes.large.price}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Availability toggle */}
                <button
                  onClick={() =>
                    handleToggle(item._id!, item.available === false)
                  }
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    item.available !== false ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      item.available !== false
                        ? "translate-x-4.5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id!)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
