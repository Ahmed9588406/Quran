"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Plus,
  X,
  Phone,
  Clock,
  Users,
  Radio,
  ChevronRight,
  Locate,
  Layers,
} from "lucide-react";
import { Mosque } from "@/lib/streaming/types";

// Mock mosques data - in production, this would come from an API
const MOCK_MOSQUES: Mosque[] = [
  {
    id: "1",
    name: "Al-Noor Mosque",
    address: "123 Main Street",
    city: "Doha",
    country: "Qatar",
    latitude: 25.2867,
    longitude: 51.5333,
    preacherName: "Sheikh Ahmed",
  },
  {
    id: "2",
    name: "Central Mosque",
    address: "456 Center Ave",
    city: "Doha",
    country: "Qatar",
    latitude: 25.2919,
    longitude: 51.5310,
    preacherName: "Sheikh Mohammed",
  },
  {
    id: "3",
    name: "East Side Mosque",
    address: "789 East Road",
    city: "Doha",
    country: "Qatar",
    latitude: 25.2800,
    longitude: 51.5400,
    preacherName: "Sheikh Ibrahim",
  },
  {
    id: "4",
    name: "Katara Mosque",
    address: "Katara Cultural Village",
    city: "Doha",
    country: "Qatar",
    latitude: 25.3600,
    longitude: 51.5250,
    preacherName: "Sheikh Yusuf",
  },
  {
    id: "5",
    name: "Grand Mosque",
    address: "Grand Plaza",
    city: "Doha",
    country: "Qatar",
    latitude: 25.2750,
    longitude: 51.5200,
    preacherName: "Sheikh Ali",
  },
];

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Map Component using Leaflet
function MapView({
  mosques,
  userLocation,
  selectedMosque,
  onSelectMosque,
}: {
  mosques: Mosque[];
  userLocation: { lat: number; lng: number } | null;
  selectedMosque: Mosque | null;
  onSelectMosque: (mosque: Mosque) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Load Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map centered on Doha
      const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [25.2867, 51.5333];

      const map = L.map(mapRef.current).setView(center, 13);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Custom mosque icon
      const mosqueIcon = L.divIcon({
        className: "custom-mosque-marker",
        html: `<div style="background-color: #8A1538; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4 8v14h16V8l-8-6zm0 2.5L18 9v11H6V9l6-4.5z"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Add user location marker if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("Your Location");
      }

      // Add mosque markers
      mosques.forEach((mosque) => {
        if (mosque.latitude && mosque.longitude) {
          const marker = L.marker([mosque.latitude, mosque.longitude], {
            icon: mosqueIcon,
          })
            .addTo(map)
            .bindPopup(
              `<div style="min-width: 150px;">
                <strong style="color: #8A1538;">${mosque.name}</strong>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${mosque.address || ""}</p>
                ${mosque.preacherName ? `<p style="font-size: 11px; color: #888;">Preacher: ${mosque.preacherName}</p>` : ""}
              </div>`
            );

          marker.on("click", () => onSelectMosque(mosque));
          markersRef.current.push(marker);
        }
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [mosques, userLocation, onSelectMosque]);

  // Pan to selected mosque
  useEffect(() => {
    if (mapInstanceRef.current && selectedMosque?.latitude && selectedMosque?.longitude) {
      mapInstanceRef.current.setView([selectedMosque.latitude, selectedMosque.longitude], 15);
    }
  }, [selectedMosque]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}

function MosqueCard({
  mosque,
  distance,
  isSelected,
  onClick,
}: {
  mosque: Mosque;
  distance?: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? "bg-[#8A1538] text-white shadow-lg"
          : "bg-white hover:bg-[#FFF9F3] border border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? "bg-white/20" : "bg-[#FFF9F3]"
          }`}
        >
          <MapPin className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#8A1538]"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${isSelected ? "text-white" : "text-[#231217]"}`}>
            {mosque.name}
          </h4>
          <p className={`text-sm truncate ${isSelected ? "text-white/80" : "text-gray-500"}`}>
            {mosque.address}
          </p>
          {distance !== undefined && (
            <p className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
              {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
            </p>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? "text-white" : "text-gray-400"}`} />
      </div>
    </button>
  );
}

function MosqueDetailPanel({
  mosque,
  distance,
  onClose,
  onAssignRoom,
}: {
  mosque: Mosque;
  distance?: number;
  onClose: () => void;
  onAssignRoom: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-[#8A1538] to-[#6d1029]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-semibold text-white">{mosque.name}</h3>
          <p className="text-white/80 text-sm">{mosque.city}, {mosque.country}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5 text-[#8A1538]" />
          <span className="text-sm">{mosque.address}</span>
        </div>

        {mosque.preacherName && (
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="w-5 h-5 text-[#8A1538]" />
            <span className="text-sm">Preacher: {mosque.preacherName}</span>
          </div>
        )}

        {distance !== undefined && (
          <div className="flex items-center gap-3 text-gray-600">
            <Navigation className="w-5 h-5 text-[#8A1538]" />
            <span className="text-sm">
              {distance < 1 ? `${Math.round(distance * 1000)} meters` : `${distance.toFixed(2)} km`} from your location
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 space-y-3">
          <button
            onClick={onAssignRoom}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
          >
            <Radio className="w-4 h-4" />
            Assign Streaming Room
          </button>
          <button className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Navigation className="w-4 h-4" />
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MosquesMap() {
  const [mosques, setMosques] = useState<Mosque[]>(MOCK_MOSQUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearestMosque, setNearestMosque] = useState<Mosque | null>(null);

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setIsLocating(false);

        // Calculate distances and find nearest mosque
        const mosquesWithDistance = mosques.map((mosque) => ({
          ...mosque,
          distance: mosque.latitude && mosque.longitude
            ? calculateDistance(location.lat, location.lng, mosque.latitude, mosque.longitude)
            : Infinity,
        }));

        mosquesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        setMosques(mosquesWithDistance);

        if (mosquesWithDistance.length > 0) {
          setNearestMosque(mosquesWithDistance[0]);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Unable to get your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [mosques]);

  // Filter mosques by search
  const filteredMosques = mosques.filter(
    (mosque) =>
      mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mosque.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mosque.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignRoom = () => {
    if (selectedMosque) {
      // Navigate to streams management or open assign modal
      alert(`Assign streaming room to ${selectedMosque.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#8A1538]">Mosques Map</h1>
          <p className="text-sm text-gray-500 mt-1">Find and manage mosque locations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={getUserLocation}
            disabled={isLocating}
            className="flex items-center gap-2 h-11 px-5 rounded-lg border border-[#8A1538] text-[#8A1538] font-medium hover:bg-[#FFF9F3] transition-colors disabled:opacity-50"
          >
            <Locate className={`w-5 h-5 ${isLocating ? "animate-pulse" : ""}`} />
            {isLocating ? "Locating..." : "Find Nearest"}
          </button>
          <button className="flex items-center gap-2 h-11 px-5 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors">
            <Plus className="w-5 h-5" />
            Add Mosque
          </button>
        </div>
      </div>

      {/* Nearest Mosque Alert */}
      {nearestMosque && userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Navigation className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Nearest Mosque Found</p>
            <p className="text-green-700">
              {nearestMosque.name} -{" "}
              {nearestMosque.distance && nearestMosque.distance < 1
                ? `${Math.round(nearestMosque.distance * 1000)}m away`
                : `${nearestMosque.distance?.toFixed(1)}km away`}
            </p>
          </div>
          <button
            onClick={() => setSelectedMosque(nearestMosque)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            View Details
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Mosque List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mosques..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
            />
          </div>

          {/* Mosque List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredMosques.map((mosque) => (
              <MosqueCard
                key={mosque.id}
                mosque={mosque}
                distance={mosque.distance}
                isSelected={selectedMosque?.id === mosque.id}
                onClick={() => setSelectedMosque(mosque)}
              />
            ))}

            {filteredMosques.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No mosques found</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px]">
            <MapView
              mosques={filteredMosques}
              userLocation={userLocation}
              selectedMosque={selectedMosque}
              onSelectMosque={setSelectedMosque}
            />
          </div>

          {/* Selected Mosque Detail */}
          {selectedMosque && (
            <div className="mt-4">
              <MosqueDetailPanel
                mosque={selectedMosque}
                distance={selectedMosque.distance}
                onClose={() => setSelectedMosque(null)}
                onAssignRoom={handleAssignRoom}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
