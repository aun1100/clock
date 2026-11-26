'use client';

import React, { useState, useEffect, useRef } from 'react';

type TabType = 'world' | 'alarm' | 'stopwatch' | 'timer';

interface AlarmItem {
  id: number;
  time: string;
  label: string;
  active: boolean;
}

interface WorldCity {
  id: string;
  city: string;
  tz: string;
}

export default function MobileClockApp() {
  const [activeTab, setActiveTab] = useState<TabType>('world');
  const [now, setNow] = useState<Date | null>(null);

  // --- States: World Clock (เพิ่ม/ลบเมืองได้) ---
  const [worldCities, setWorldCities] = useState<WorldCity[]>([
    { id: '1', city: 'กรุงเทพฯ', tz: 'Asia/Bangkok' },
    { id: '2', city: 'โตเกียว', tz: 'Asia/Tokyo' },
    { id: '3', city: 'ลอนดอน', tz: 'Europe/London' },
    { id: '4', city: 'นิวยอร์ก', tz: 'America/New_York' },
  ]);
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityTz, setNewCityTz] = useState('Asia/Seoul');

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
    return <main className="min-h-[100dvh] bg-[#07090e]" />;
  }

  // จัดรูปแบบเวลาแต่ละโซน
  const formatWorldTime = (timeZone: string) => {
    try {
      return now.toLocaleTimeString('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const calculateOffset = (timeZone: string) => {
    try {
      const localDate = new Date();
      const tzDateStr = localDate.toLocaleString('en-US', { timeZone });
      const tzDate = new Date(tzDateStr);
      const diffHours = Math.round((tzDate.getTime() - localDate.getTime()) / (1000 * 60 * 60));
      if (diffHours === 0) return 'เวลาตรงกัน (+0 ชม.)';
      return diffHours > 0 ? `ล่วงหน้า +${diffHours} ชม.` : `ตามหลัง ${diffHours} ชม.`;
    } catch {
      return timeZone;
    }
  };

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

  // วงแหวน Timer
  const radius = 92;
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

  const handleAddCity = () => {
    if (!newCityName.trim()) return;
    setWorldCities([
      ...worldCities,
      { id: Date.now().toString(), city: newCityName.trim(), tz: newCityTz },
    ]);
    setNewCityName('');
    setShowAddCity(false);
  };

  const handleRemoveCity = (id: string) => {
    setWorldCities(worldCities.filter((c) => c.id !== id));
  };

  return (
    <main className="min-h-[100dvh] w-full bg-gradient-to-b from-[#0d111a] via-[#080a0f] to-[#050608] text-white flex flex-col select-none">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between">
        {/* ================= เนื้อหาหลัก ================= */}
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28">
          
          {/* ================= TAB 1: WORLD CLOCK ================= */}
          {activeTab === 'world' && (
            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-5">
                <div>
                  <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase">
                    System Time
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                    เวลาโลก
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddCity(!showAddCity)}
                    className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 flex items-center justify-center text-2xl active:scale-95 transition cursor-pointer"
                    title="เพิ่มเมือง"
                  >
                    +
                  </button>
                  <span className="text-xs text-zinc-400 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                    {now.toLocaleDateString('th-TH', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* ฟอร์มเพิ่มเมืองใหม่ */}
              {showAddCity && (
                <div className="mb-4 p-4 rounded-2xl bg-zinc-900/95 border border-cyan-500/40 space-y-3 animate-fadeIn">
                  <p className="text-xs font-semibold text-cyan-300">เพิ่มเมืองหรือประเทศที่คุณต้องการ</p>
                  <input
                    type="text"
                    placeholder="ชื่อเมือง (เช่น โซล, ปารีส)"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full bg-black text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 outline-none focus:border-cyan-400"
                  />
                  <select
                    value={newCityTz}
                    onChange={(e) => setNewCityTz(e.target.value)}
                    className="w-full bg-black text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 outline-none focus:border-cyan-400"
                  >
                    <option value="Asia/Bangkok">🇹🇭 กรุงเทพฯ (Bangkok)</option>
                    <option value="Asia/Tokyo">🇯🇵 โตเกียว (Tokyo)</option>
                    <option value="Asia/Seoul">🇰🇷 โซล (Seoul)</option>
                    <option value="Asia/Shanghai">🇨🇳 ปักกิ่ง / เซี่ยงไฮ้ (Beijing)</option>
                    <option value="Asia/Singapore">🇸🇬 สิงคโปร์ (Singapore)</option>
                    <option value="Europe/London">🇬🇧 ลอนดอน (London)</option>
                    <option value="Europe/Paris">🇫🇷 ปารีส (Paris)</option>
                    <option value="America/New_York">🇺🇸 นิวยอร์ก (New York)</option>
                    <option value="America/Los_Angeles">🇺🇸 ลอสแอนเจลิส (Los Angeles)</option>
                    <option value="Australia/Sydney">🇦🇺 ซิดนีย์ (Sydney)</option>
                  </select>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowAddCity(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleAddCity}
                      className="px-4 py-2 rounded-xl bg-cyan-600 active:bg-cyan-500 text-xs font-bold cursor-pointer"
                    >
                      ยืนยันเพิ่ม
                    </button>
                  </div>
                </div>
              )}

              {/* นาฬิกาเข็มหลัก (กรุงเทพฯ) */}
              <div className="relative mx-auto my-3 w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-zinc-950/90 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.18)] flex items-center justify-center">
                <div className="absolute inset-2.5 rounded-full border border-dashed border-zinc-800" />
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full flex justify-center p-2"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <div
                      className={`w-0.5 rounded-full ${
                        i % 3 === 0
                          ? 'h-3.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                          : 'h-1.5 bg-zinc-700'
                      }`}
                    />
                  </div>
                ))}
                <div
                  className="absolute bottom-1/2 w-1.5 h-12 bg-white rounded-full origin-bottom shadow"
                  style={{ transform: `rotate(${hourDeg}deg)` }}
                />
                <div
                  className="absolute bottom-1/2 w-1 h-16 bg-cyan-400 rounded-full origin-bottom shadow-[0_0_8px_#22d3ee]"
                  style={{ transform: `rotate(${minuteDeg}deg)` }}
                />
                <div
                  className="absolute bottom-1/2 w-0.5 h-20 bg-fuchsia-500 rounded-full origin-bottom shadow-[0_0_8px_#d946ef]"
                  style={{ transform: `rotate(${secondDeg}deg)` }}
                />
                <div className="w-3 h-3 rounded-full bg-fuchsia-500 border-2 border-black z-10" />
              </div>

              {/* รายการเมือง (Dynamic List เพิ่ม/ลบได้) */}
              <div className="mt-5 space-y-3">
                {worldCities.map((item, index) => (
                  <div
                    key={item.id}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all ${
                      index === 0
                        ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                        : 'bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-zinc-400">{calculateOffset(item.tz)}</p>
                      <p className="text-lg font-semibold text-zinc-100">{item.city}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-mono font-light tracking-wider text-cyan-300">
                        {formatWorldTime(item.tz)}
                      </div>
                      {/* ปุ่มลบเมือง (ไม่ให้ลบเมืองแรกสุดที่เป็นหลัก) */}
                      {worldCities.length > 1 && (
                        <button
                          onClick={() => handleRemoveCity(item.id)}
                          className="w-7 h-7 rounded-full bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 flex items-center justify-center text-xs transition cursor-pointer"
                          title="ลบเมืองนี้"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: ALARM ================= */}
          {activeTab === 'alarm' && (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-xs text-fuchsia-400 font-mono tracking-wider uppercase">
                    Wake Up
                  </p>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-fuchsia-400 bg-clip-text text-transparent">
                    นาฬิกาปลุก
                  </h1>
                </div>
                <button
                  onClick={() => setShowAddAlarm(!showAddAlarm)}
                  className="w-10 h-10 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 flex items-center justify-center text-2xl active:scale-95 transition cursor-pointer"
                >
                  +
                </button>
              </div>

              {showAddAlarm && (
                <div className="mb-4 p-3.5 rounded-2xl bg-zinc-900/90 border border-fuchsia-500/40 flex items-center justify-between gap-3">
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="bg-black text-white font-mono text-xl px-3 py-2 rounded-xl border border-zinc-700 outline-none flex-1"
                  />
                  <button
                    onClick={handleAddAlarm}
                    className="px-5 py-2.5 rounded-xl bg-fuchsia-600 active:bg-fuchsia-500 text-sm font-bold tracking-wide cursor-pointer"
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
                      <div className="text-4xl font-mono font-light tracking-tight">
                        {alarm.time}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{alarm.label}</div>
                    </div>

                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                        alarm.active
                          ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500'
                          : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          alarm.active ? 'translate-x-6' : 'translate-x-0'
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
            <div className="flex flex-col">
              <div className="mb-5">
                <p className="text-xs text-emerald-400 font-mono tracking-wider uppercase">
                  Chronograph
                </p>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
                  จับเวลา
                </h1>
              </div>

              <div className="my-4 py-10 rounded-3xl bg-zinc-950/80 border border-emerald-500/25 shadow-[inset_0_0_30px_rgba(16,185,129,0.08)] flex items-center justify-center">
                <span className="text-5xl sm:text-6xl font-mono font-light tracking-wider text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                  {formatStopwatch(swTime)}
                </span>
              </div>

              <div className="flex justify-around items-center my-6">
                <button
                  onClick={() => {
                    if (swRunning) {
                      setLaps([swTime, ...laps]);
                    } else {
                      setSwTime(0);
                      setLaps([]);
                    }
                  }}
                  className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-semibold active:scale-95 transition cursor-pointer"
                >
                  {swRunning ? 'รอบ' : 'รีเซ็ต'}
                </button>

                <button
                  onClick={() => setSwRunning(!swRunning)}
                  className={`w-20 h-20 rounded-full text-sm font-bold tracking-wider active:scale-95 transition cursor-pointer border ${
                    swRunning
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                      : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {swRunning ? 'หยุด' : 'เริ่ม'}
                </button>
              </div>

              {laps.length > 0 && (
                <div className="space-y-2 border-t border-white/10 pt-4">
                  {laps.map((lap, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm px-4 py-3 rounded-xl bg-white/[0.03] font-mono"
                    >
                      <span className="text-zinc-400">รอบที่ {laps.length - idx}</span>
                      <span className="text-emerald-300 font-semibold">
                        {formatStopwatch(lap)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: TIMER ================= */}
          {activeTab === 'timer' && (
            <div className="flex flex-col">
              <div className="mb-3">
                <p className="text-xs text-amber-400 font-mono tracking-wider uppercase">
                  Countdown
                </p>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
                  นับถอยหลัง
                </h1>
              </div>

              <div className="relative my-4 mx-auto w-60 h-60 flex items-center justify-center">
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
                  <span className="text-5xl font-mono font-bold text-amber-300">
                    {formatTimer(timerLeft)}
                  </span>
                  <span className="text-xs text-zinc-400 mt-1.5">
                    {timerLeft === 0 ? 'หมดเวลา!' : timerRunning ? 'กำลังนับถอยหลัง' : 'พร้อมทำงาน'}
                  </span>
                </div>
              </div>

              {!timerRunning && (
                <div className="grid grid-cols-4 gap-2 my-3">
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
                      className="py-2.5 rounded-xl bg-white/5 active:bg-amber-500/20 border border-white/10 text-xs font-medium text-zinc-300 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-around items-center mt-6">
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerLeft(timerTotal);
                  }}
                  className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-semibold active:scale-95 transition cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={() => {
                    if (timerLeft === 0) setTimerLeft(timerTotal);
                    setTimerRunning(!timerRunning);
                  }}
                  className={`w-20 h-20 rounded-full text-sm font-bold tracking-wider active:scale-95 transition cursor-pointer border ${
                    timerRunning
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {timerRunning ? 'พัก' : 'เริ่ม'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM NAVIGATION BAR ================= */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#090b10]/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,12px)] pt-2 z-50">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1 px-2">
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
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive ? `${tab.color} scale-105` : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="text-xl mb-0.5">{tab.icon}</span>
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}