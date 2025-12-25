/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../khateeb_Profile/Sidebar";
import NavBar from "../user/navbar";
import { useRouter } from "next/navigation";

type CalendarDay = {
  date: Date;
  iso: string; // yyyy-mm-dd
  inCurrentMonth: boolean;
  isToday: boolean;
  hijri?: { year: number; month: number; day: number };
};

type EventItem = {
  id: string;
  title: string;
  time?: string;
  color?: string; // tailwind bg class or hex
  isKhotba?: boolean;
};

const STORAGE_KEY = "quran_schedule_events_v2";
const defaultColors = ["bg-gray-400", "bg-orange-400", "bg-red-500", "bg-green-500", "bg-blue-500"];

// Hijri date conversion
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function buildMonthMatrix(year: number, month: number): CalendarDay[][] {
  const first = startOfMonth(year, month);
  const startWeekDay = first.getDay();
  const startDate = new Date(first);
  startDate.setDate(first.getDate() - startWeekDay);

  const matrix: CalendarDay[][] = [];
  const cur = new Date(startDate);
  const today = new Date();
  const todayISO = toISODate(today);
  
  for (let week = 0; week < 6; week++) {
    const row: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      const iso = toISODate(cur);
      row.push({
        date: new Date(cur),
        iso,
        inCurrentMonth: cur.getMonth() === month,
        isToday: iso === todayISO,
        hijri: gregorianToHijri(cur),
      });
      cur.setDate(cur.getDate() + 1);
    }
    matrix.push(row);
  }
  return matrix;
}

export default function SchedulePage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date();
  // Initialize with current date
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedIso, setSelectedIso] = useState<string>(toISODate(today));
  const [viewType, setViewType] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  const [events, setEvents] = useState<Record<string, EventItem[]>>({});

  const router = useRouter();

  // load from localStorage (both regular events and scheduled khotbas)
  useEffect(() => {
    try {
      // Load regular events
      const raw = localStorage.getItem(STORAGE_KEY);
      let loadedEvents: Record<string, EventItem[]> = {};
      
      if (raw) {
        loadedEvents = JSON.parse(raw);
      }
      
      // Load scheduled khotbas
      const scheduledKhotbas = localStorage.getItem('scheduled_khotbas');
      if (scheduledKhotbas) {
        const khotbas = JSON.parse(scheduledKhotbas);
        // Merge khotbas into events
        for (const [date, khotbaList] of Object.entries(khotbas)) {
          if (!loadedEvents[date]) {
            loadedEvents[date] = [];
          }
          // Add khotbas that aren't already in events
          const existingIds = new Set(loadedEvents[date].map(e => e.id));
          for (const khotba of khotbaList as EventItem[]) {
            if (!existingIds.has(khotba.id)) {
              loadedEvents[date].push({
                ...khotba,
                color: khotba.color || 'bg-green-500',
              });
            }
          }
        }
      }
      
      // Add default events if nothing loaded
      if (Object.keys(loadedEvents).length === 0) {
        const today = new Date();
        loadedEvents = {
          [toISODate(today)]: [{ id: "e1", title: "Lesson on the pillars of prayer", time: "" }],
          [toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))]: [{ id: "e2", title: "Lesson on the pillars of prayer", time: "" }],
        };
      }
      
      setEvents(loadedEvents);
    } catch (e) {
      // ignore
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      // Only save non-khotba events to regular storage
      const scheduledKhotbas = JSON.parse(localStorage.getItem('scheduled_khotbas') || '{}');
      const scheduledIds = new Set<string>();
      for (const khotbaList of Object.values(scheduledKhotbas)) {
        for (const khotba of khotbaList as EventItem[]) {
          scheduledIds.add(khotba.id);
        }
      }
      
      // Filter out scheduled khotbas from regular events
      const regularEvents: Record<string, EventItem[]> = {};
      for (const [date, eventList] of Object.entries(events)) {
        const filtered = eventList.filter(e => !scheduledIds.has(e.id));
        if (filtered.length > 0) {
          regularEvents[date] = filtered;
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(regularEvents));
    } catch (e) {
      // ignore
    }
  }, [events]);

  const monthName = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [viewYear, viewMonth]);

  // Get today's date info for display
  const todayInfo = useMemo(() => {
    const now = new Date();
    return {
      dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
      date: now.getDate(),
      month: now.toLocaleDateString('en-US', { month: 'long' }),
      year: now.getFullYear(),
      iso: toISODate(now)
    };
  }, []);

  const matrix = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectPrev = () => {
    if (viewType === 'monthly') {
      if (viewMonth === 0) {
        setViewYear(y => y - 1);
        setViewMonth(11);
      } else setViewMonth(m => m - 1);
    } else if (viewType === 'weekly') {
      // move by 7 days relative to currently selectedIso
      const d = new Date(selectedIso);
      d.setDate(d.getDate() - 7);
      setSelectedIso(toISODate(d));
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else {
      const d = new Date(selectedIso);
      d.setDate(d.getDate() - 1);
      setSelectedIso(toISODate(d));
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const selectNext = () => {
    if (viewType === 'monthly') {
      if (viewMonth === 11) {
        setViewYear(y => y + 1);
        setViewMonth(0);
      } else setViewMonth(m => m + 1);
    } else if (viewType === 'weekly') {
      const d = new Date(selectedIso);
      d.setDate(d.getDate() + 7);
      setSelectedIso(toISODate(d));
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else {
      const d = new Date(selectedIso);
      d.setDate(d.getDate() + 1);
      setSelectedIso(toISODate(d));
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const goToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedIso(toISODate(today));
  };

  // helpers to generate weekly/daily grids
  const generateWeekly = (isoCenter: string) => {
    const center = new Date(isoCenter);
    center.setHours(0, 0, 0, 0);
    const dayOfWeek = center.getDay();
    const sunday = new Date(center);
    sunday.setDate(center.getDate() - dayOfWeek);
    const days: CalendarDay[] = [];
    const todayISO = toISODate(new Date());
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const iso = toISODate(d);
      days.push({
        date: d,
        iso,
        inCurrentMonth: d.getMonth() === viewMonth,
        isToday: iso === todayISO, // Compare with actual today
      });
    }
    return days;
  };

  const generateDaily = (iso: string) => {
    const d = new Date(iso);
    const todayISO = toISODate(new Date());
    return [{
      date: d,
      iso,
      inCurrentMonth: d.getMonth() === viewMonth,
      isToday: iso === todayISO, // Compare with actual today
    }];
  };

  // modal state
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalDateIso, setModalDateIso] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newColor, setNewColor] = useState<string>(defaultColors[0]);

  const openModalFor = (iso: string) => {
    setModalDateIso(iso);
    setNewTitle("");
    setNewTime("");
    setNewColor(defaultColors[0]);
    setModalOpen(true);
    setSelectedIso(iso);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDateIso(null);
  };

  const addEvent = () => {
    if (!modalDateIso || newTitle.trim() === "") return;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setEvents(prev => {
      const list = prev[modalDateIso] ? [...prev[modalDateIso]] : [];
      list.push({ id, title: newTitle.trim(), time: newTime || undefined, color: newColor });
      return { ...prev, [modalDateIso]: list };
    });
    closeModal();
  };

  const deleteEvent = (iso: string, id: string) => {
    setEvents(prev => {
      const list = (prev[iso] ?? []).filter(e => e.id !== id);
      const copy = { ...prev };
      if (list.length === 0) delete copy[iso];
      else copy[iso] = list;
      return copy;
    });
  };

  const openPrepareKhotba = (iso: string) => {
    // navigate to prepare_khotba page with date query param
    router.push(`/Schedual/prepare_khotba?date=${iso}`);
  };

  // compute grid to render depending on viewType
  const weeklyDays = useMemo(() => generateWeekly(selectedIso), [selectedIso, viewMonth]);
  const daily = useMemo(() => generateDaily(selectedIso), [selectedIso]);

  // Add Today button to the header
  const renderTodayButton = () => (
    <button
      onClick={goToToday}
      className="px-4 py-2 rounded-md bg-[#8A1538] text-white text-sm font-medium hover:bg-[#6d1029] transition-colors ml-4"
    >
      Today
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fffaf8]">
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} onOpenMessages={() => { /* open chat */ }} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 text-base text-[#8A1538] mt-8 mb-6">
            <a href="/app/user" className="flex items-center gap-2 hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </a>
          </div>

          <h1 className="text-4xl font-semibold text-[#2b2b2b] mb-6">Schedule Meeting:</h1>

          {/* Today's info banner */}
          <div className="mb-6 p-4 bg-[#fff8f0] rounded-lg border border-[#f5e8dc]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8A1538] text-white rounded-full flex items-center justify-center text-lg font-bold">
                {todayInfo.date}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">Today is {todayInfo.dayName}</div>
                <div className="text-gray-600">{todayInfo.month} {todayInfo.date}, {todayInfo.year}</div>
              </div>
            </div>
          </div>

          {/* Colored header container */}
          <div className="bg-[#FFFDF9] rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button aria-label="Previous" onClick={selectPrev} className="w-11 h-11 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div className="text-2xl font-medium text-gray-800 min-w-[220px] text-center">
                  {viewType === 'monthly' ? monthName : viewType === 'weekly' ? `Week of ${weeklyDays[0]?.date.toLocaleDateString()}` : new Date(selectedIso).toLocaleDateString()}
                </div>

                <button aria-label="Next" onClick={selectNext} className="w-11 h-11 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                
                {renderTodayButton()}
              </div>

              <div className="flex items-center gap-0 bg-[#fff8f0] rounded-full p-2 border border-[#f5e8dc]">
                <button onClick={() => { setViewType('monthly'); setSelectedIso(toISODate(new Date(viewYear, viewMonth, 1))); }} className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${viewType === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Monthly</button>
                <button onClick={() => setViewType('weekly')} className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${viewType === 'weekly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Weekly</button>
                <button onClick={() => setViewType('daily')} className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${viewType === 'daily' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Daily</button>
              </div>
            </div>

            {/* Weekdays inside colored header */}
            <div className="grid grid-cols-7 mt-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-lg font-semibold text-gray-700">
                  {day}
                  {day === todayInfo.dayName.slice(0, 3) && (
                    <div className="text-xs font-normal text-[#8A1538] mt-1">Today</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Friday / الجمعة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Scheduled Khotba / خطبة مجدولة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8A1538] rounded-full"></div>
              <span>Today / اليوم</span>
            </div>
          </div>

          {/* Calendar area */}
          <div className="bg-white border border-[#e0d5d3] rounded-lg overflow-hidden shadow-sm">
            {/* Monthly view */}
            {viewType === 'monthly' && (
              <div className="grid grid-cols-7">
                {matrix.flat().map(day => {
                  const dayEvents = events[day.iso] ?? [];
                  const isSelected = selectedIso === day.iso;
                  const isToday = day.isToday;
                  const isFriday = day.date.getDay() === 5;
                  const hasKhotba = dayEvents.some(ev => ev.isKhotba || ev.color === 'bg-green-500');
                  
                  return (
                    <button
                      key={day.iso}
                      onClick={() => setSelectedIso(day.iso)}
                      onDoubleClick={(e) => { e.stopPropagation(); openPrepareKhotba(day.iso); }}
                      className={`min-h-[150px] p-3 text-left border-r border-b border-[#e0d5d3] transition-colors relative 
                        ${isSelected ? "bg-[#fff7f6]" : "hover:bg-gray-50"} 
                        ${day.inCurrentMonth ? "" : "bg-gray-50 opacity-60"}
                        ${isFriday && day.inCurrentMonth ? "bg-green-50/50" : ""}
                        ${hasKhotba ? "ring-2 ring-inset ring-green-400" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {isToday ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#8A1538] text-white rounded-full flex items-center justify-center text-sm font-semibold">{day.date.getDate()}</div>
                            </div>
                          ) : (
                            <span className={`text-base font-medium ${day.inCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>{day.date.getDate()}</span>
                          )}
                          {/* Hijri date */}
                          {day.hijri && day.inCurrentMonth && (
                            <div className="text-xs text-[#8A1538] mt-0.5" dir="rtl">
                              {day.hijri.day}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          {isFriday && day.inCurrentMonth && (
                            <div className="text-[10px] text-green-600 font-medium">الجمعة</div>
                          )}
                          {isToday && (
                            <div className="text-[10px] text-[#8A1538] font-medium">Today</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className={`${ev.color ?? 'bg-gray-400'} text-white text-xs px-2 py-1.5 rounded flex items-center justify-between`}>
                            <span className="truncate pr-1">{ev.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteEvent(day.iso, ev.id); }} className="ml-1 text-[10px] opacity-80 hover:opacity-100">✕</button>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Weekly view */}
            {viewType === 'weekly' && (
              <div className="grid grid-cols-7">
                {weeklyDays.map(day => {
                  const dayEvents = events[day.iso] ?? [];
                  const isSelected = selectedIso === day.iso;
                  const isToday = day.isToday;
                  return (
                    <div
                      key={day.iso}
                      // allow double-click on the column to open prepare_khotba
                      onDoubleClick={() => openPrepareKhotba(day.iso)}
                      className={`min-h-[220px] p-4 text-left border-r border-b border-[#e0d5d3] ${isSelected ? "bg-[#fff7f6]" : ""} ${isToday ? "bg-[#fff0f0]" : ""}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-sm text-gray-500">
                            {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                          <div className={`text-lg font-semibold ${isToday ? 'text-[#8A1538]' : ''}`}>
                            {day.date.getDate()}
                            {isToday && <span className="ml-2 text-sm font-normal text-[#8A1538]">(Today)</span>}
                          </div>
                        </div>
                        <div>
                          <button onClick={() => openModalFor(day.iso)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Add</button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {dayEvents.length ? dayEvents.map(ev => (
                          <div key={ev.id} className={`flex items-center justify-between ${ev.color ?? 'bg-gray-400'} text-white px-3 py-2 rounded`}>
                            <div className="truncate">{ev.title}{ev.time ? ` • ${ev.time}` : ''}</div>
                            <button onClick={() => deleteEvent(day.iso, ev.id)} className="text-xs opacity-80 ml-2">✕</button>
                          </div>
                        )) : <div className="text-sm text-gray-400">No events</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Daily view */}
            {viewType === 'daily' && (
              <div className="p-6">
                {daily.map(day => {
                  const dayEvents = events[day.iso] ?? [];
                  const isToday = day.isToday;
                  return (
                    <div key={day.iso} onDoubleClick={() => openPrepareKhotba(day.iso)}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-gray-500">{day.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div className={`text-2xl font-semibold ${isToday ? 'text-[#8A1538]' : ''}`}>
                            {day.date.getDate()}
                            {isToday && <span className="ml-4 text-lg font-normal text-[#8A1538]">Today</span>}
                          </div>
                        </div>
                        <div>
                          <button onClick={() => openModalFor(day.iso)} className="px-4 py-2 rounded bg-blue-600 text-white">Add Event</button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {dayEvents.length ? dayEvents.map(ev => (
                          <div key={ev.id} className={`flex items-center justify-between ${ev.color ?? 'bg-gray-400'} text-white px-3 py-2 rounded`}>
                            <div>{ev.title}{ev.time ? ` • ${ev.time}` : ''}</div>
                            <button onClick={() => deleteEvent(day.iso, ev.id)} className="text-xs opacity-80">Delete</button>
                          </div>
                        )) : <div className="text-gray-500">No events for this day</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal for adding event */}
      {isModalOpen && modalDateIso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">{new Date(modalDateIso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="text-lg font-semibold">Add Event</div>
              </div>
              <button onClick={closeModal} className="text-gray-500">Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Time (optional)</label>
                <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="14:00" className="w-full mt-1 px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Color</label>
                <div className="flex gap-2 mt-2">
                  {defaultColors.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} className={`${c} w-8 h-8 rounded ${newColor === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={addEvent} className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
                <button onClick={closeModal} className="px-4 py-2 rounded border">Cancel</button>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Existing events</div>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {(events[modalDateIso] ?? []).map(ev => (
                    <div key={ev.id} className="flex items-center justify-between">
                      <div className={`${ev.color ?? 'bg-gray-400'} text-white text-sm px-3 py-1 rounded`}>{ev.title}{ev.time ? ` • ${ev.time}` : ''}</div>
                      <button onClick={() => deleteEvent(modalDateIso, ev.id)} className="text-xs text-red-500">Delete</button>
                    </div>
                  ))}
                  {!(events[modalDateIso]?.length) && <div className="text-sm text-gray-500">No events</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating messages button */}
      <button aria-label="Open messages" className="fixed bottom-6 right-6 bg-[#8A1538] text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-[#6d1029] transition-colors text-lg">
        <span className="font-medium">Messages</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>
    </div>
  );
}