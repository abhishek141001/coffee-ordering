"use client";

import { useEffect, useState } from "react";
import { shopApiCall, getShopInfo } from "../../../lib/shopAuth";

interface ShopDetails {
  name: string;
  slug: string;
  status: "active" | "inactive";
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export default function SettingsPage() {
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationSuccess, setLocationSuccess] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const shopInfo = getShopInfo();

  useEffect(() => {
    async function fetchShopDetails() {
      try {
        const data = await shopApiCall<ShopDetails>(
          "GET",
          "/shop-dashboard/details"
        );
        setStatus(data.status);
        if (data.location && data.location.latitude) {
          setCurrentLocation(data.location);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    fetchShopDetails();
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

  const handleUpdateLocation = () => {
    setLocationError("");
    setLocationSuccess("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await shopApiCall<{
            message: string;
            location: { latitude: number; longitude: number; address: string };
          }>("PATCH", "/shop-dashboard/location", {
            latitude,
            longitude,
          });
          setCurrentLocation(data.location);
          setLocationSuccess(
            `Location updated to ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          );
        } catch (err) {
          setLocationError(
            err instanceof Error ? err.message : "Failed to update location"
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(
              "Location permission denied. Please allow location access in your browser settings."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-12">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {shopInfo && (
        <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Shop Info</h3>
          <p className="text-white font-medium text-lg">{shopInfo.name}</p>
          <p className="text-zinc-500 text-sm mt-1">Slug: {shopInfo.slug}</p>
        </div>
      )}

      <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">
          Shop Availability
        </h3>
        <p className="text-zinc-500 text-sm mb-4">
          When inactive, your shop will not appear in nearby shop searches.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleToggle("active")}
            disabled={updating}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === "active"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="bg-[#111118] border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">
          Shop Location
        </h3>
        <p className="text-zinc-500 text-sm mb-4">
          Update your shop&apos;s location so nearby customers can find you.
          This uses your browser&apos;s GPS.
        </p>

        {currentLocation && (
          <div className="bg-zinc-900 rounded-lg p-4 mb-4 border border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Current location</div>
            <div className="text-white text-sm font-mono">
              {currentLocation.latitude.toFixed(6)},{" "}
              {currentLocation.longitude.toFixed(6)}
            </div>
            {currentLocation.address && (
              <div className="text-zinc-400 text-sm mt-1">
                {currentLocation.address}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleUpdateLocation}
          disabled={locationLoading}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {locationLoading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Getting location...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Update to current location
            </>
          )}
        </button>

        {locationError && (
          <p className="text-red-400 text-sm mt-3">{locationError}</p>
        )}
        {locationSuccess && (
          <p className="text-green-400 text-sm mt-3">{locationSuccess}</p>
        )}
      </div>
    </div>
  );
}
