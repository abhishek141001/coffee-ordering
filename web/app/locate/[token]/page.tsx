"use client";

import { useEffect, useState, useCallback, use } from "react";

type Status = "requesting" | "address" | "saving" | "success" | "error" | "denied";

export default function LocatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [status, setStatus] = useState<Status>("requesting");
  const [errorMsg, setErrorMsg] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const saveLocation = useCallback(
    async (lat: number, lng: number, addr: string) => {
      setStatus("saving");
      try {
        const res = await fetch("/api/auth/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationToken: token,
            latitude: lat,
            longitude: lng,
            address: addr,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMsg(data.error || "Failed to save location");
          return;
        }

        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMsg("Network error. Please try again.");
      }
    },
    [token]
  );

  const requestLocation = useCallback(() => {
    setStatus("requesting");
    setErrorMsg("");

    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("address");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("error");
          setErrorMsg("Location unavailable. Please try again.");
        } else {
          setStatus("error");
          setErrorMsg("Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">&#9749;</div>
          <h1 className="text-xl font-bold">
            Caffeine<span className="text-amber-400">Operator</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Location capture</p>
        </div>

        <div className="bg-[#111118] border border-zinc-800 rounded-2xl p-8 text-center">
          {status === "requesting" && (
            <>
              <div className="mb-4">
                <svg
                  className="animate-spin w-10 h-10 text-amber-400 mx-auto"
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
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Requesting location...
              </h2>
              <p className="text-zinc-400 text-sm">
                Please allow location access when prompted.
              </p>
            </>
          )}

          {status === "address" && (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
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
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                GPS location captured!
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                Add your address details so the shop can find you.
              </p>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Building no, Floor, Landmark"
                className="w-full bg-[#060b18] border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => coords && saveLocation(coords.lat, coords.lng, address.trim())}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Save Location
                </button>
                <button
                  onClick={() => coords && saveLocation(coords.lat, coords.lng, "")}
                  className="text-zinc-500 hover:text-zinc-300 px-4 py-2.5 text-sm transition-colors"
                >
                  Skip
                </button>
              </div>
            </>
          )}

          {status === "saving" && (
            <>
              <div className="mb-4">
                <svg
                  className="animate-spin w-10 h-10 text-amber-400 mx-auto"
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
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Saving location...
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-400 mb-2">
                Location saved!
              </h2>
              <p className="text-zinc-400 text-sm">
                You can close this tab and return to your terminal.
              </p>
            </>
          )}

          {status === "denied" && (
            <>
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-400"
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
              </div>
              <h2 className="text-lg font-semibold text-amber-400 mb-2">
                Location access denied
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                Please enable location access in your browser settings and try
                again.
              </p>
              <button
                onClick={requestLocation}
                className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Try again
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-red-400 mb-2">
                Something went wrong
              </h2>
              <p className="text-zinc-400 text-sm mb-4">{errorMsg}</p>
              <button
                onClick={requestLocation}
                className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
