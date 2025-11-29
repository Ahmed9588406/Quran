"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

type Mosque = {
  name: string;
  lat: number;
  lon: number;
  distanceMeters?: number;
};

function haversine(aLat: number, aLon: number, bLat: number, bLon: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(aLat);
  const φ2 = toRad(bLat);
  const Δφ = toRad(bLat - aLat);
  const Δλ = toRad(bLon - aLon);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

export default function RightSide() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
  const [nextPrayerTime, setNextPrayerTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("--:--:--");
  const intervalRef = useRef<number | null>(null);

  // compute Arabic Islamic (Hijri) date string on client
  const islamicDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchNearestMosque = async (lat: number, lon: number) => {
      try {
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        // search within 5000m for amenity=mosque (nodes/ways/relations)
        const query = `
          [out:json][timeout:25];
          (
            node(around:5000,${lat},${lon})["amenity"="mosque"];
            way(around:5000,${lat},${lon})["amenity"="mosque"];
            relation(around:5000,${lat},${lon})["amenity"="mosque"];
          );
          out center;`;
        const res = await fetch(overpassUrl, {
          method: "POST",
          body: query,
        });
        if (!res.ok) throw new Error("Overpass query failed");
        const data = await res.json();
        const elements = data.elements || [];
        if (!elements.length) {
          setMosque({ name: "Nearby Mosque", lat, lon, distanceMeters: undefined });
          return;
        }
        // normalize coords and find nearest
        let best: Mosque | null = null;
        for (const el of elements) {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (elLat == null || elLon == null) continue;
          const dist = haversine(lat, lon, elLat, elLon);
          const name = (el.tags && (el.tags.name || el.tags["name:en"])) || "Mosque";
          if (!best || dist < (best.distanceMeters || Infinity)) {
            best = { name, lat: elLat, lon: elLon, distanceMeters: dist };
          }
        }
        if (best && !cancelled) setMosque(best);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to find nearby mosque");
      }
    };

    const fetchTimings = async (lat: number, lon: number) => {
      try {
        // Aladhan free API, returns timings in local timezone
        const timestamp = Math.floor(Date.now() / 1000);
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=2`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Aladhan API failed");
        const json = await res.json();
        const timings = json.data.timings;
        // order to check for "next"
        const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const now = new Date();
        const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
        let foundNext: { name: string; date: Date } | null = null;
        for (const name of order) {
          const timeStr = timings[name]; // e.g., "05:12"
          if (!timeStr) continue;
          const [hh, mm] = timeStr.split(":").map((s: string) => parseInt(s, 10));
          const dt = new Date(`${todayStr}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`);
          // if dt is earlier than now, skip
          if (dt.getTime() > now.getTime()) {
            foundNext = { name, date: dt };
            break;
          }
        }
        // if none found, next is tomorrow's Fajr
        if (!foundNext) {
          // use Fajr time and add one day
          const fajrStr = timings["Fajr"];
          if (fajrStr) {
            const [hh, mm] = fajrStr.split(":").map((s: string) => parseInt(s, 10));
            const dt = new Date(`${todayStr}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`);
            dt.setDate(dt.getDate() + 1);
            foundNext = { name: "Fajr", date: dt };
          }
        }
        if (foundNext && !cancelled) {
          setNextPrayerName(foundNext.name);
          setNextPrayerTime(foundNext.date);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch prayer timings");
      }
    };

    const locateAndLoad = () => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          await Promise.all([fetchNearestMosque(lat, lon), fetchTimings(lat, lon)]);
          if (!cancelled) {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setError("Location access denied");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    locateAndLoad();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // countdown updater
  useEffect(() => {
    if (!nextPrayerTime) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, nextPrayerTime.getTime() - now.getTime());
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      if (diff <= 0) {
        // refresh timings once countdown reaches 0
        window.location.reload();
      }
    };
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nextPrayerTime]);

  // Google Maps link for directions
  const getMapsLink = () => {
    if (!mosque) return "https://www.google.com/maps";
    return `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;
  };

  // Render updated card matching provided design (smaller)
  return (
    <div className="space-y-4 w-full">
      {/* Main Mosque Card - reduced height and made width fluid */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 text-white shadow-sm border border-gray-800">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>

        {/* smaller heights so card fits in right column without scrolling */}
        <div className="relative h-44 sm:h-48 lg:h-56 flex flex-col justify-between p-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
              {/* mosque svg */}
              <Image
                src="/icons/mosque-location.svg"
                alt="Mosque"
                width={28}
                height={28}
                draggable="false"
              />
            </div>

            <div>
              <div className="text-sm text-white/80">Mosque</div>
              <div className="text-lg font-semibold">{mosque?.name ?? "Msheireb Mosque"}</div>
              {islamicDate && <div className="text-xs text-white/80">{islamicDate}</div>}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal">Salat {nextPrayerName ?? "—"} After</h2>
              <p className="text-xs text-white/80">
                {nextPrayerTime
                  ? nextPrayerTime.toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>

            <div className="text-3xl font-light tracking-wider">{countdown}</div>

            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-white/80">
                {mosque?.distanceMeters ? `${Math.round(mosque.distanceMeters)} m` : ""}
              </div>
              <a
                href={getMapsLink()}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-white text-[#7b2030] px-2 py-0.5 rounded-md font-medium hover:bg-white/90"
              >
                Get directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* additional sidebar content can be rendered here (profile, suggestions) */}
    </div>
  );
}
