'use client';

import React, { useState, useEffect, useRef } from 'react';

type TabType = 'world' | 'alarm' | 'stopwatch' | 'timer';

interface AlarmItem {
  id: number;
  time: string;
  label: string;
  active: boolean;
}

export default function FuturisticIphoneClock() {
  const [activeTab, setActiveTab] = useState<TabType>('world');
  const [now, setNow] = useState<Date | null>(null);

  // --- States: Alarm ---
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: 1, time: '06:30', label: 'ตื่นไปลุยงาน', active: true },
    { id: 2, time: '08:00', label: 'ประชุมทีม / เข้าเรียน', active: false },
    { id: 3, time: '22:45', label: 'เตรียมตัวพักผ่อน', active: true },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [showAddAlarm, setShowAddAlarm] = useState(false);

  // --- States: Stopwatch ---
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  // --- States: Timer ---
  const [timerInputMin, setTimerInputMin] = useState(1);
  const [timerInputSec, setTimerInputSec] = useState(30);
  const [timerLeft, setTimerLeft] = useState(90);
  const [timerTotal, setTimerTotal] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  // อัปเดตเวลาหลักทุก 1 วินาที
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ระบบจับเวลา (Stopwatch)
  useEffect(() => {
    if (swRunning) {
      const startTime = Date.now() - swTime;
      swRef.current = setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 30);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
  }, [swRunning]);

  // ระบบนับถอยหลัง (Timer)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerLeft]);

  if (!now) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-[375px] h-[780px] rounded-[50px] bg-zinc-900 animate-pulse border-4 border-zinc-800" />
      </main>
    );
  }

  // จัดรูปแบบเวลาต่างๆ
  const formatWorldTime = (timeZone: string) =>
    now.toLocaleTimeString('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // คำนวณเข็มนาฬิกา
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  // คำนวณเส้นวงกลม Timer
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    timerTotal > 0 ? circumference - (timerLeft / timerTotal) * circumference : circumference;

  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const handleAddAlarm = () => {
    setAlarms([
      ...alarms,
      { id: Date.now(), time: newAlarmTime, label: 'ปลุกใหม่', active: true },
    ]);
    setShowAddAlarm(false);
  };

  return (
    <main className="min-h-screen bg-[#050508] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#050508] to-black flex items-center justify-center p-4 select-none font-sans">
      {/* ตัวเครื่อง iPhone Frame */}
      <div className="relative w-[380px] h-[790px] bg-[#0a0a0f] rounded-[54px] p-3 shadow-[0_0_60px_rgba(6,182,212,0.25)] border-[3px] border-zinc-700/80 ring-1 ring-white/10 flex flex-col">
        {/* ปุ่มข้างตัวเครื่อง (ตกแต่ง) */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-8 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[5px] top-40 w-[3px] h-14 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[5px] top-56 w-[3px] h-14 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[5px] top-44 w-[3px] h-20 bg-zinc-600 rounded-r" />

        {/* หน้าจอแสดงผลด้านใน */}
        <div className="relative flex-1 bg-gradient-to-b from-[#0d111a] via-[#090b10] to-[#050608] rounded-[42px] overflow-hidden flex flex-col text-white">
          {/* Status Bar + Dynamic Island */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold tracking-wider z-20">
            <span>
              {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Dynamic Island */}
            <div className="w-28 h-7 bg-black rounded-full border border-zinc-800/80 flex items-center justify-between px-3 shadow-inner">
              <span
                className={`w-2 h-2 rounded-full ${
                  swRunning || timerRunning
                    ? 'bg-cyan-400 animate-ping'
                    : 'bg-emerald-500/80'
                }`}
              />
              <span className="text-[10px] font-mono text-cyan-300">
                {swRunning
                  ? 'REC'
                  : timerRunning
                  ? formatTimer(timerLeft)
                  : '5G MAX'}
              </span>
            </div>

            {/* ไอคอนแบตเตอรี่ & สัญญาณ */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[1.5px] h-2.5">
                <span className="w-[2px] h-1 bg-white rounded-full" />
                <span className="w-[2px] h-1.5 bg-white rounded-full" />
                <span className="w-[2px] h-2 bg-white rounded-full" />
                <span className="w-[2px] h-2.5 bg-cyan-400 rounded-full" />
              </div>
              <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
                <div className="w-full h-full bg-cyan-400 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* พื้นที่เนื้อหาหลัก (สลับตาม Tab) */}
          <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 scrollbar-none">
            {/* ================= TAB 1: WORLD CLOCK ================= */}
            {activeTab === 'world' && (
              <div className="animate-fadeIn flex flex-col h-full">
                <div className="flex justify-between items-end mb-4">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                    เวลาโลก
                  </h1>
                  <span className="text-xs text-cyan-400/80 font-mono">
                    {now.toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                </div>

                {/* นาฬิกาเข็ม Cyber Analog */}
                <div className="relative mx-auto my-2 w-44 h-44 rounded-full bg-zinc-950/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full border border-dashed border-zinc-800" />
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-full flex justify-center p-1.5"
                      style={{ transform: `rotate(${i * 30}deg)` }}
                    >
                      <div
                        className={`w-0.5 rounded-full ${
                          i % 3 === 0 ? 'h-3 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'h-1.5 bg-zinc-700'
                        }`}
                      />
                    </div>
                  ))}
                  {/* เข็มชั่วโมง */}
                  <div
                    className="absolute bottom-1/2 w-1.5 h-11 bg-white rounded-full origin-bottom shadow"
                    style={{ transform: `rotate(${hourDeg}deg)` }}
                  />
                  {/* เข็มนาที */}
                  <div
                    className="absolute bottom-1/2 w-1 h-15 bg-cyan-400 rounded-full origin-bottom shadow-[0_0_8px_#22d3ee]"
                    style={{ transform: `rotate(${minuteDeg}deg)` }}
                  />
                  {/* เข็มวินาที */}
                  <div
                    className="absolute bottom-1/2 w-0.5 h-18 bg-fuchsia-500 rounded-full origin-bottom shadow-[0_0_8px_#d946ef]"
                    style={{ transform: `rotate(${secondDeg}deg)` }}
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 border-2 border-black z-10" />
                </div>

                {/* รายการเมืองต่างๆ */}
                <div className="mt-4 space-y-2.5">
                  {[
                    { city: 'กรุงเทพฯ', offset: 'วันนี้ +0 ชม.', tz: 'Asia/Bangkok', active: true },
                    { city: 'โตเกียว', offset: 'วันนี้ +2 ชม.', tz: 'Asia/Tokyo', active: false },
                    { city: 'ลอนดอน', offset: 'วันนี้ -7 ชม.', tz: 'Europe/London', active: false },
                    { city: 'นิวยอร์ก', offset: 'เมื่อวาน -12 ชม.', tz: 'America/New_York', active: false },
                  ].map((item) => (
                    <div
                      key={item.city}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
                        item.active
                          ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-white/[0.03] border-white/5'
                      }`}
                    >
                      <div>
                        <p className="text-[11px] text-zinc-400">{item.offset}</p>
                        <p className="text-base font-semibold text-zinc-100">{item.city}</p>
                      </div>
                      <div className="text-2xl font-mono font-light tracking-wider text-cyan-300">
                        {formatWorldTime(item.tz)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 2: ALARM ================= */}
            {activeTab === 'alarm' && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-fuchsia-400 bg-clip-text text-transparent">
                    นาฬิกาปลุก
                  </h1>
                  <button
                    onClick={() => setShowAddAlarm(!showAddAlarm)}
                    className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 flex items-center justify-center text-xl hover:bg-fuchsia-500/40 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {showAddAlarm && (
                  <div className="mb-4 p-3 rounded-2xl bg-zinc-900/90 border border-fuchsia-500/40 flex items-center justify-between gap-2">
                    <input
                      type="time"
                      value={newAlarmTime}
                      onChange={(e) => setNewAlarmTime(e.target.value)}
                      className="bg-black text-white font-mono text-lg px-3 py-1.5 rounded-xl border border-zinc-700 outline-none"
                    />
                    <button
                      onClick={handleAddAlarm}
                      className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-xs font-bold tracking-wide cursor-pointer"
                    >
                      บันทึก
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        alarm.active
                          ? 'bg-zinc-900/80 border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.12)]'
                          : 'bg-white/[0.02] border-white/5 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="text-3xl font-mono font-light tracking-tight">
                          {alarm.time}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">{alarm.label}</div>
                      </div>

                      {/* iOS Toggle Switch */}
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                          alarm.active
                            ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500'
                            : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            alarm.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 3: STOPWATCH ================= */}
            {activeTab === 'stopwatch' && (
              <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent mb-4">
                  จับเวลา
                </h1>

                {/* จอแสดงผลตัวเลขใหญ่ */}
                <div className="my-6 py-8 rounded-3xl bg-zinc-950/80 border border-emerald-500/20 shadow-[inset_0_0_30px_rgba(16,185,129,0.08)] flex items-center justify-center">
                  <span className="text-5xl font-mono font-light tracking-wider text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                    {formatStopwatch(swTime)}
                  </span>
                </div>

                {/* ปุ่มควบคุม */}
                <div className="flex justify-between px-4 mb-6">
                  <button
                    onClick={() => {
                      if (swRunning) {
                        setLaps([swTime, ...laps]);
                      } else {
                        setSwTime(0);
                        setLaps([]);
                      }
                    }}
                    className="w-18 h-18 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
                  >
                    {swRunning ? 'รอบ' : 'รีเซ็ต'}
                  </button>

                  <button
                    onClick={() => setSwRunning(!swRunning)}
                    className={`w-18 h-18 rounded-full text-xs font-bold tracking-wider transition cursor-pointer border ${
                      swRunning
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                        : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    {swRunning ? 'หยุด' : 'เริ่ม'}
                  </button>
                </div>

                {/* รายการบันทึก Lap */}
                <div className="flex-1 overflow-y-auto space-y-2 border-t border-white/10 pt-3">
                  {laps.map((lap, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs px-3 py-2 rounded-xl bg-white/[0.03] font-mono"
                    >
                      <span className="text-zinc-400">รอบที่ {laps.length - idx}</span>
                      <span className="text-emerald-300">{formatStopwatch(lap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 4: TIMER ================= */}
            {activeTab === 'timer' && (
              <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent mb-2">
                  นับถอยหลัง
                </h1>

                {/* วงแหวน Progress Ring */}
                <div className="relative my-4 mx-auto w-56 h-56 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                    <circle
                      cx="110"
                      cy="110"
                      r={radius}
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r={radius}
                      stroke="#f59e0b"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-mono font-bold text-amber-300">
                      {formatTimer(timerLeft)}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      {timerLeft === 0 ? 'หมดเวลา!' : 'กำลังทำงาน'}
                    </span>
                  </div>
                </div>

                {/* ตั้งค่าเวลาด่วน */}
                {!timerRunning && (
                  <div className="flex justify-center gap-2 mb-5">
                    {[
                      { label: '1 นาที', sec: 60 },
                      { label: '3 นาที', sec: 180 },
                      { label: '5 นาที', sec: 300 },
                      { label: '10 นาที', sec: 600 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setTimerTotal(preset.sec);
                          setTimerLeft(preset.sec);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 text-[11px] text-zinc-300 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ปุ่มเริ่ม / ยกเลิก */}
                <div className="flex justify-between px-4 mt-auto mb-2">
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerLeft(timerTotal);
                    }}
                    className="w-18 h-18 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    ยกเลิก
                  </button>

                  <button
                    onClick={() => {
                      if (timerLeft === 0) setTimerLeft(timerTotal);
                      setTimerRunning(!timerRunning);
                    }}
                    className={`w-18 h-18 rounded-full text-xs font-bold tracking-wider cursor-pointer border ${
                      timerRunning
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    }`}
                  >
                    {timerRunning ? 'พัก' : 'เริ่ม'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= BOTTOM TAB BAR (สไตล์ iOS) ================= */}
          <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 pt-2.5 pb-6">
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'world', label: 'เวลาโลก', icon: '🌐', color: 'text-cyan-400' },
                { id: 'alarm', label: 'ปลุก', icon: '⏰', color: 'text-fuchsia-400' },
                { id: 'stopwatch', label: 'จับเวลา', icon: '⏱️', color: 'text-emerald-400' },
                { id: 'timer', label: 'นับถอยหลัง', icon: '⏳', color: 'text-amber-400' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                      isActive ? `${tab.color} scale-105` : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{tab.icon}</span>
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ขีด Home Indicator ด้านล่างสุดของ iPhone */}
            <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-3" />
          </div>
        </div>
      </div>
    </main>
  );
}