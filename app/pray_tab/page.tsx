"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Volume2 } from "lucide-react";
import { Coordinates, PrayerTimes, CalculationMethod } from "adhan";

const NavBar = dynamic(() => import("../user/navbar"), { ssr: false });
const LeftSide = dynamic(() => import("../user/leftside"), { ssr: false });
const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

// Date selector data (will be updated with real dates)
const initialDates = [
  { day: "04", weekday: "Friday", date: 26 },
  { day: "05", weekday: "Tuesday", date: 27 },
  { day: "06", weekday: "Tuesday", date: 29, selected: true },
  { day: "07", weekday: "Wednesday", date: 30 },
];

export default function PrayTabPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activeView, setActiveView] = useState("pray");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prayerTimes, setPrayerTimes] = useState<any>({});
  const [datesState] = useState(initialDates); // keep initialDates constant reference if needed
  const [selectedDateIndex, setSelectedDateIndex] = useState(2); // index of selected date
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  // stable computed dates (no state updates inside effect)
  const dates = useMemo(() => {
    const today = new Date();
    return datesState.map((d, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() + idx - 2);
      return {
        day: date.toLocaleDateString("en-US", { day: "2-digit" }),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.getDate(),
        dateObj: date,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* no deps - computed once per mount from initialDates */]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError("Unable to get location. Using default coordinates.");
          setLocation({ lat: 21.3891, lng: 39.8579 }); // Default to Mecca
        }
      );
    } else {
      setLocationError("Geolocation not supported. Using default coordinates.");
      setLocation({ lat: 21.3891, lng: 39.8579 });
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  // Calculate prayer times when location or selected date changes
  useEffect(() => {
    if (!location) return;

    const calculateTimes = (date: Date) => {
      const coordinates = new Coordinates(location.lat, location.lng);
      const params = CalculationMethod.MuslimWorldLeague();
      const pt = new PrayerTimes(coordinates, date, params);
      return {
        fajr: formatTime(pt.fajr),
        sunrise: formatTime(pt.sunrise),
        dhuhr: formatTime(pt.dhuhr),
        asr: formatTime(pt.asr),
        maghrib: formatTime(pt.maghrib),
        isha: formatTime(pt.isha),
        raw: pt, // keep raw if needed
      };
    };

    // use selected date from memoized dates
    const selected = dates[selectedDateIndex]?.dateObj ?? new Date();
    const todayTimes = calculateTimes(selected);
    setPrayerTimes({
      fajr: todayTimes.fajr,
      sunrise: todayTimes.sunrise,
      dhuhr: todayTimes.dhuhr,
      asr: todayTimes.asr,
      maghrib: todayTimes.maghrib,
      isha: todayTimes.isha,
    });

    // determine next prayer relative to now (always compare to current time)
    const now = new Date();
    const prayers = [
      { name: "Fajr", timeStr: todayTimes.fajr },
      { name: "Dhuhr", timeStr: todayTimes.dhuhr },
      { name: "Asr", timeStr: todayTimes.asr },
      { name: "Maghrib", timeStr: todayTimes.maghrib },
      { name: "Isha", timeStr: todayTimes.isha },
    ];

    let nextPrayerTime: Date | null = null;
    let nextPrayerName = "";

    for (const p of prayers) {
      // parse "h:mm AM/PM" robustly using Date on the selected date
      const parsed = new Date(selected);
      const [time, meridiem] = p.timeStr.split(" ");
      const [hStr, mStr] = time.split(":");
      let hours = Number(hStr);
      const minutes = Number(mStr);
      if (meridiem && meridiem.toUpperCase().includes("PM") && hours < 12) hours += 12;
      if (meridiem && meridiem.toUpperCase().includes("AM") && hours === 12) hours = 0;
      parsed.setHours(hours, minutes, 0, 0);

      if (parsed > now) {
        nextPrayerTime = parsed;
        nextPrayerName = p.name;
        break;
      }
    }

    if (!nextPrayerTime) {
      // fallback to next day's fajr
      const tomorrow = new Date(selected);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = calculateTimes(tomorrow);
      const [hStr, mStr] = tomorrowTimes.fajr.split(" ")[0].split(":");
      let hours = Number(hStr);
      const minutes = Number(mStr);
      const meridiem = tomorrowTimes.fajr.split(" ")[1];
      if (meridiem && meridiem.toUpperCase().includes("PM") && hours < 12) hours += 12;
      if (meridiem && meridiem.toUpperCase().includes("AM") && hours === 12) hours = 0;
      nextPrayerTime = new Date(tomorrow);
      nextPrayerTime.setHours(hours, minutes, 0, 0);
      nextPrayerName = "Fajr";
    }

    setNextPrayer(`Next Prayer: Salat ${nextPrayerName}`);

    const interval = setInterval(() => {
      const nowInner = new Date();
      const diff = nextPrayerTime!.getTime() - nowInner.getTime();

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [location, selectedDateIndex, dates]);

  const handleDateSelect = (index: number) => {
    setSelectedDateIndex(index);
  };

  return (
    <div className="min-h-screen bg-[#fdf8f6] relative overflow-hidden">
    
      {/* Navbar */}
      <NavBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        isSidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <LeftSide
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setActiveView}
        activeView={activeView}
      />

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Prayer Timer & Date Selector */}
          <div className="flex-1">
            {/* Prayer Timer Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0e6e5] mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                  <h2 className="text-[#7b2030] font-semibold text-lg mb-1">
                    {nextPrayer}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[#7b2030] font-medium">Islamic Date</div>
                  <div className="text-[#7b2030]">1447</div>
                  <div className="text-gray-500 text-sm">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-2">
                <div className="text-6xl lg:text-7xl font-bold text-[#2d2d2d] tracking-tight">
                  {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                </div>
                <div className="text-[#7b2030] text-sm mt-1">Time remaining</div>
                {locationError && <div className="text-red-500 text-xs mt-1">{locationError}</div>}
              </div>

              {/* Date Selector */}
              <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                {dates.map((d, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-50 py-3 px-2 rounded-xl text-center cursor-pointer transition-all ${
                      idx === selectedDateIndex
                        ? "bg-[#7b2030] text-white"
                        : "bg-[#f5ebe9] text-[#2d2d2d] hover:bg-[#edddd9]"
                    }`}
                    onClick={() => handleDateSelect(idx)}
                  >
                    <div className={`text-2xl font-bold ${idx === selectedDateIndex ? "text-white" : "text-[#c4a35a]"}`}>
                      {d.day}
                    </div>
                    <div className={`text-xs ${idx === selectedDateIndex ? "text-white" : "text-gray-500"}`}>
                      {d.weekday}
                    </div>
                    <div className={`text-lg font-semibold ${idx === selectedDateIndex ? "text-white" : "text-[#c4a35a]"}`}>
                      {d.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prayer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <PrayerCard name="Fajr Prayer" time={prayerTimes.fajr || "Loading..."} />
              <PrayerCard name="Dhuhr Prayer" time={prayerTimes.dhuhr || "Loading..."} />
              <PrayerCard name="Asr Prayer" time={prayerTimes.asr || "Loading..."} />
              <PrayerCard name="Maghrib Prayer" time={prayerTimes.maghrib || "Loading..."} />
              <PrayerCard name="Isha'a Prayer" time={prayerTimes.isha || "Loading..."} />
            </div>
          </div>

          {/* Right Column - Today's Schedule */}
          <div className="w-full lg:w-72">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0e6e5]">
              <h3 className="text-[#BA9C63] font-semibold text-lg mb-4">Today&apos;s Schedule</h3>
              <div className="space-y-4">
                <ScheduleItem name="Fajr" time={prayerTimes.fajr || "Loading..."} highlight />
                <ScheduleItem name="Sunrise" time={prayerTimes.sunrise || "Loading..."} />
                <ScheduleItem name="Dhuhr" time={prayerTimes.dhuhr || "Loading..."} />
                <ScheduleItem name="Asr" time={prayerTimes.asr || "Loading..."} />
                <ScheduleItem name="Maghrib" time={prayerTimes.maghrib || "Loading..."} />
                <ScheduleItem name="Isha'a" time={prayerTimes.isha || "Loading..."} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Messages Button */}
      <button
        onClick={() => setMessagesOpen(true)}
        className="fixed right-6 bottom-6 bg-[#7b2030]  text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-3 transition-colors border border-[#e5d5d2]"
      >
        <span className="font-medium">Messages</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={messagesOpen}
        onClose={() => setMessagesOpen(false)}
      />
    </div>
  );
}

// Prayer Card Component
function PrayerCard({ name, time }: { name: string; time: string }) {
  return (
    <div className="w-full h-[106px] bg-white rounded-[24px] border border-[#f0e6e5] shadow-sm overflow-hidden">
      <div className="h-full flex items-center justify-between px-6">
        <div>
          <div className="text-[#BA9C63] text-sm font-medium mb-1">{name}</div>
          <div className="text-[#BA9C63] text-2xl font-bold leading-tight">{time}</div>
        </div>

        {/* icon area (keeps same visual position as screenshot) */}
        <button className="p-2 text-gray-400 hover:text-[#BA9C63] transition-colors" aria-label="sound">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Schedule Item Component
function ScheduleItem({ name, time, highlight }: { name: string; time: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f0e6e5] last:border-b-0">
      <span className={`text-sm ${highlight ? "text-[#7b2030] font-medium" : "text-gray-600"}`}>
        {name}
      </span>
      <span className={`text-sm font-semibold text-[#7b2030]`}>
        {time}
      </span>
    </div>
  );
}

