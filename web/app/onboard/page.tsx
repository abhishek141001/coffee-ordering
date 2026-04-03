"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MenuItem, OnboardFormData } from "../../lib/types";
import { apiCall } from "../../lib/api";
import { setShopToken, setShopInfo } from "../../lib/shopAuth";

const STEPS = [
  "Account",
  "Location",
  "Menu",
  "Telegram",
  "Hours",
  "Review",
];

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1 sm:gap-2">
          <div
            className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              i <= current
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-slate-500"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs sm:text-sm whitespace-nowrap hidden sm:inline ${
              i <= current ? "text-white" : "text-slate-500"
            }`}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-4 sm:w-8 h-0.5 ${
                i < current ? "bg-amber-600" : "bg-slate-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#122240] border border-slate-600 rounded-lg px-4 py-2.5 sm:py-2 text-white placeholder-slate-500 focus:border-amber-600 focus:outline-none text-base sm:text-sm"
      />
    </div>
  );
}

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [form, setForm] = useState<OnboardFormData>({
    name: "",
    owner: { name: "", email: "", phone: "" },
    location: { coordinates: [0, 0], address: "" },
    menu: [
      {
        name: "",
        description: "",
        basePrice: 0,
        sizes: {
          small: { price: 0 },
          medium: { price: 0 },
          large: { price: 0 },
        },
      },
    ],
    telegramChatId: "",
    operatingHours: { open: "08:00", close: "22:00" },
  });

  function updateForm(updates: Partial<OnboardFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function addMenuItem() {
    setForm((prev) => ({
      ...prev,
      menu: [
        ...prev.menu,
        {
          name: "",
          description: "",
          basePrice: 0,
          sizes: {
            small: { price: 0 },
            medium: { price: 0 },
            large: { price: 0 },
          },
        },
      ],
    }));
  }

  function updateMenuItem(index: number, updates: Partial<MenuItem>) {
    setForm((prev) => ({
      ...prev,
      menu: prev.menu.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  }

  function removeMenuItem(index: number) {
    setForm((prev) => ({
      ...prev,
      menu: prev.menu.filter((_, i) => i !== index),
    }));
  }

  function validateStep(): boolean {
    setErrorMsg("");
    if (step === 0) {
      if (!form.name || !form.owner.name || !form.owner.email) {
        setErrorMsg("Please fill in all required fields");
        return false;
      }
      if (!password || password.length < 6) {
        setErrorMsg("Password must be at least 6 characters");
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return false;
      }
    }
    if (step === 1) {
      if (!form.location.address || !form.location.coordinates[0] || !form.location.coordinates[1]) {
        setErrorMsg("Please fill in address and coordinates");
        return false;
      }
    }
    if (step === 2) {
      if (form.menu.some((item) => !item.name || !item.basePrice)) {
        setErrorMsg("Each menu item needs a name and price");
        return false;
      }
    }
    if (step === 3) {
      if (!form.telegramChatId) {
        setErrorMsg("Telegram Chat ID is required");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const result = await apiCall<{
        message: string;
        token: string;
        shop: { id: string; name: string; slug: string };
      }>("POST", "/shops/onboard", { ...form, password });
      setShopToken(result.token);
      setShopInfo(result.shop);
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#060b18] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-slate-500 hover:text-white text-sm mb-6 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Register Your Coffee Shop</h1>
        <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">
          Set up your shop in 5 minutes. Start receiving orders from developers
          nearby.
        </p>

        <StepIndicator current={step} steps={STEPS} />

        {/* Step 1: Account (Shop Info + Password) */}
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label="Shop Name"
              value={form.name}
              onChange={(v) => updateForm({ name: v })}
              placeholder="Blue Tokai Coffee"
              required
            />
            <Input
              label="Owner Name"
              value={form.owner.name}
              onChange={(v) =>
                updateForm({ owner: { ...form.owner, name: v } })
              }
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              value={form.owner.email}
              onChange={(v) =>
                updateForm({ owner: { ...form.owner, email: v } })
              }
              type="email"
              placeholder="john@example.com"
              required
            />
            <Input
              label="Phone"
              value={form.owner.phone}
              onChange={(v) =>
                updateForm({ owner: { ...form.owner, phone: v } })
              }
              placeholder="+91 98765 43210"
            />
            <div className="border-t border-slate-700 pt-4 mt-2">
              <p className="text-sm text-slate-400 mb-3">
                Set a password for your dashboard login
              </p>
              <div className="space-y-4">
                <Input
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                />
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type="password"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Address"
              value={form.location.address}
              onChange={(v) =>
                updateForm({
                  location: { ...form.location, address: v },
                })
              }
              placeholder="123 MG Road, Bangalore"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Longitude"
                value={String(form.location.coordinates[0] || "")}
                onChange={(v) =>
                  updateForm({
                    location: {
                      ...form.location,
                      coordinates: [
                        parseFloat(v) || 0,
                        form.location.coordinates[1],
                      ],
                    },
                  })
                }
                type="number"
                placeholder="77.5946"
                required
              />
              <Input
                label="Latitude"
                value={String(form.location.coordinates[1] || "")}
                onChange={(v) =>
                  updateForm({
                    location: {
                      ...form.location,
                      coordinates: [
                        form.location.coordinates[0],
                        parseFloat(v) || 0,
                      ],
                    },
                  })
                }
                type="number"
                placeholder="12.9716"
                required
              />
            </div>
            <p className="text-xs text-slate-500">
              Tip: Find coordinates on Google Maps by right-clicking your shop
              location.
            </p>
          </div>
        )}

        {/* Step 3: Menu */}
        {step === 2 && (
          <div className="space-y-6">
            {form.menu.map((item, i) => (
              <div
                key={i}
                className="bg-[#122240] rounded-lg p-4 border border-slate-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Item {i + 1}
                  </span>
                  {form.menu.length > 1 && (
                    <button
                      onClick={() => removeMenuItem(i)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Name"
                    value={item.name}
                    onChange={(v) => updateMenuItem(i, { name: v })}
                    placeholder="cappuccino"
                    required
                  />
                  <Input
                    label="Base Price (Medium)"
                    value={String(item.basePrice || "")}
                    onChange={(v) => {
                      const price = parseInt(v) || 0;
                      updateMenuItem(i, {
                        basePrice: price,
                        sizes: {
                          small: { price: Math.round(price * 0.8) },
                          medium: { price },
                          large: { price: Math.round(price * 1.2) },
                        },
                      });
                    }}
                    type="number"
                    placeholder="200"
                    required
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(v) => updateMenuItem(i, { description: v })}
                    placeholder="Classic Italian espresso with steamed milk"
                  />
                </div>
                {item.basePrice > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Prices: Small &#8377;{item.sizes.small.price} &middot;
                    Medium &#8377;{item.sizes.medium.price} &middot; Large
                    &#8377;{item.sizes.large.price}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addMenuItem}
              className="w-full border border-dashed border-slate-600 rounded-lg py-3 text-slate-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              + Add Menu Item
            </button>
          </div>
        )}

        {/* Step 4: Telegram */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#122240] rounded-lg p-4 border border-slate-700 mb-4">
              <h3 className="font-semibold mb-2">Setup Instructions:</h3>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>Open Telegram and search for @BotFather</li>
                <li>Send /newbot and follow the prompts</li>
                <li>Send a message to your new bot</li>
                <li>
                  Visit{" "}
                  <code className="text-amber-400 text-xs sm:text-sm break-all">
                    https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
                  </code>
                </li>
                <li>
                  Find your <code className="text-amber-400">chat id</code> in
                  the response
                </li>
              </ol>
            </div>
            <Input
              label="Telegram Chat ID"
              value={form.telegramChatId}
              onChange={(v) => updateForm({ telegramChatId: v })}
              placeholder="123456789"
              required
            />
          </div>
        )}

        {/* Step 5: Hours */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                value={form.operatingHours.open}
                onChange={(v) =>
                  updateForm({
                    operatingHours: { ...form.operatingHours, open: v },
                  })
                }
                type="time"
              />
              <Input
                label="Closing Time"
                value={form.operatingHours.close}
                onChange={(v) =>
                  updateForm({
                    operatingHours: { ...form.operatingHours, close: v },
                  })
                }
                type="time"
              />
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-[#122240] rounded-lg p-4 border border-slate-700 space-y-3">
              <div>
                <span className="text-slate-500 text-sm">Shop:</span>
                <span className="ml-2 font-semibold">{form.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Owner:</span>
                <span className="ml-2">
                  {form.owner.name} ({form.owner.email})
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Location:</span>
                <span className="ml-2">{form.location.address}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Coordinates:</span>
                <span className="ml-2 font-mono text-sm">
                  {form.location.coordinates[1]},{" "}
                  {form.location.coordinates[0]}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Menu:</span>
                <span className="ml-2">
                  {form.menu.length} item{form.menu.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Hours:</span>
                <span className="ml-2">
                  {form.operatingHours.open} - {form.operatingHours.close}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Telegram:</span>
                <span className="ml-2 font-mono text-sm">
                  {form.telegramChatId}
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="text-red-400 text-sm mt-4">{errorMsg}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => { setStep((s) => Math.max(0, s - 1)); setErrorMsg(""); }}
            disabled={step === 0}
            className="px-4 py-2.5 sm:py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Shop"}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/dashboard/login"
            className="text-amber-500 hover:text-amber-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
