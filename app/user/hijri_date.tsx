import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Moon } from 'lucide-react';

const HijriCalendar = () => {
  // Function to convert Gregorian to Hijri (approximation)
  const gregorianToHijri = (date) => {
    const gYear = date.getFullYear();
    const gMonth = date.getMonth();
    const gDay = date.getDate();
    
    // Julian Day calculation
    const a = Math.floor((14 - (gMonth + 1)) / 12);
    let y = gYear + 4800 - a;
    let m = (gMonth + 1) + 12 * a - 3;
    const jd = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Convert Julian Day to Hijri
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    m = Math.floor((24 * l) / 709);
    const d = l - Math.floor((709 * m) / 24);
    y = 30 * n + j - 30;
    
    return { day: d, month: m - 1, year: y };
  };

  const today = new Date();
  const todayHijri = gregorianToHijri(today);

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(todayHijri.month);
  const [currentYear, setCurrentYear] = useState(todayHijri.year);
  const [currentDay, setCurrentDay] = useState(todayHijri.day);

  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Get days in Hijri month (approximation)
  const getDaysInMonth = (month, year) => {
    // Hijri months alternate between 29 and 30 days
    // Odd months (0, 2, 4, 6, 8, 10) have 30 days
    // Even months (1, 3, 5, 7, 9) have 29 days
    // Except Dhul Hijjah (month 11) which can have 29 or 30
    if (month === 11) {
      // Simplified: in leap years, Dhul Hijjah has 30 days
      const isLeapYear = ((year * 11 + 14) % 30) < 11;
      return isLeapYear ? 30 : 29;
    }
    return month % 2 === 0 ? 30 : 29;
  };

  const getFirstDayOfMonth = (month, year) => {
    // Simplified calculation for demonstration
    // In production, use a proper Hijri calendar library
    const baseDay = 4; // Starting reference
    const totalMonths = year * 12 + month;
    return (baseDay + totalMonths * 3) % 7;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate({ day, month: currentMonth, year: currentYear });
    }
  };

  const isToday = (day) => {
    return day === currentDay && 
           currentMonth === todayHijri.month && 
           currentYear === todayHijri.year;
  };

  const isSelected = (day) => {
    return selectedDate && 
           selectedDate.day === day && 
           selectedDate.month === currentMonth && 
           selectedDate.year === currentYear;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">التقويم الهجري</h1>
                <p className="text-sm text-gray-500">Hijri Calendar</p>
              </div>
            </div>
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold">{hijriMonths[currentMonth]}</h2>
              <p className="text-emerald-100 text-lg">{currentYear} هـ</p>
            </div>

            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center py-3 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(item.day)}
                disabled={!item.isCurrentMonth}
                className={`
                  aspect-square rounded-xl text-lg font-medium transition-all duration-200
                  ${!item.isCurrentMonth ? 'invisible' : ''}
                  ${isToday(item.day)
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg ring-2 ring-amber-300 ring-offset-2 font-bold'
                    : isSelected(item.day) 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 hover:scale-105'
                  }
                  active:scale-95
                `}
              >
                {item.day}
              </button>
            ))}
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
              <p className="text-center text-lg text-gray-700">
                <span className="font-bold text-emerald-700">التاريخ المحدد:</span>
                {' '}
                <span className="font-semibold">
                  {selectedDate.day} {hijriMonths[selectedDate.month]} {selectedDate.year} هـ
                </span>
              </p>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded"></div>
                <span>اليوم الحالي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded"></div>
                <span>التاريخ المحدد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HijriCalendar;