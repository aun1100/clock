'use client';

import React, { useState, useEffect } from 'react';

export default function ClockPage() {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState(true);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-80 h-96 rounded-3xl bg-slate-900 animate-pulse" />
      </main>
    );
  }

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = seconds * 6;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const hourDegrees = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: !is24Hour,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 w-full max-w-sm">
        {/* นาฬิกาแบบเข็ม */}
        <div className="relative w-48 h-48 rounded-full border-4 border-slate-700 bg-slate-950 shadow-inner flex items-center justify-center mb-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full flex justify-center p-1.5"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div
                className={`w-1 rounded-full ${
                  i % 3 === 0 ? 'h-3 bg-sky-400' : 'h-1.5 bg-slate-600'
                }`}
              />
            </div>
          ))}

          {/* เข็มชั่วโมง */}
          <div
            className="absolute bottom-1/2 w-1.5 h-12 bg-white rounded-full origin-bottom transition-transform duration-150"
            style={{ transform: `rotate(${hourDegrees}deg)` }}
          />

          {/* เข็มนาที */}
          <div
            className="absolute bottom-1/2 w-1 h-16 bg-slate-300 rounded-full origin-bottom transition-transform duration-150"
            style={{ transform: `rotate(${minuteDegrees}deg)` }}
          />

          {/* เข็มวินาที */}
          <div
            className="absolute bottom-1/2 w-0.5 h-20 bg-rose-500 rounded-full origin-bottom"
            style={{ transform: `rotate(${secondDegrees}deg)` }}
          />

          {/* จุดหมุนตรงกลาง */}
          <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950 z-10" />
        </div>

        {/* นาฬิกาดิจิทัล */}
        <div className="text-4xl font-mono font-bold tracking-wider text-sky-400 mb-2">
          {formattedTime}
        </div>

        {/* วันที่ภาษาไทย */}
        <p className="text-sm text-slate-400 mb-6 text-center">{formattedDate}</p>

        {/* ปุ่มสลับ 12/24 ชั่วโมง */}
        <button
          onClick={() => setIs24Hour(!is24Hour)}
          className="px-4 py-2 text-xs font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
        >
          รูปแบบ: {is24Hour ? '24 ชั่วโมง' : '12 ชั่วโมง (AM/PM)'}
        </button>
      </div>
    </main>
  );
}