import React from "react";
import {
  Compass,
  Calendar,
  Layers,
  Clock,
  TrendingUp,
  BarChart2,
  PieChart,
} from "lucide-react";

export function InsightsView() {
  const stats = [
    { label: "Total Distance", value: "9.5 km", sub: "All journeys" },
    { label: "Avg. Daily", value: "1.4 km", sub: "Last 7 days" },
    { label: "Trips", value: "4", sub: "Completed" },
    { label: "Active Hours", value: "48h", sub: "This month" },
  ];

  const dailyActivity = [
    { day: "Mon", height: "45%" },
    { day: "Tue", height: "68%" },
    { day: "Wed", height: "35%" },
    { day: "Thu", height: "75%" },
    { day: "Fri", height: "55%" },
    { day: "Sat", height: "85%" },
    { day: "Sun", height: "38%" },
  ];

  const detectedObjects = [
    { name: "Person", count: 18, color: "bg-brand-500", percent: 85 },
    { name: "Cell Phone", count: 2, color: "bg-sky-500", percent: 20 },
    { name: "Chair", count: 2, color: "bg-emerald-500", percent: 20 },
    { name: "Door", count: 2, color: "bg-amber-500", percent: 20 },
    { name: "Vase", count: 2, color: "bg-cyan-500", percent: 20 },
    { name: "Cat", count: 1, color: "bg-blue-400", percent: 10 },
  ];

  const weeklyActivity = [
    { week: "W1", count: 320 },
    { week: "W2", count: 410 },
    { week: "W3", count: 380 },
    { week: "W4", count: 460 },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your navigation trends, Thanya.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          A calm overview of your navigation habits and detection trends.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-card p-4 rounded-3xl space-y-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              {s.label}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
              {s.value}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Daily Activity Bar Chart Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Daily Activity</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Walking hours</span>
        </div>

        <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2">
          {dailyActivity.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className="w-full rounded-2xl bg-gradient-to-t from-brand-600 to-sky-400 transition-all duration-500 hover:opacity-90 shadow-sm"
                style={{ height: d.height }}
              />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Detected Objects Breakdown Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Most Detected Objects
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Count</span>
        </div>

        <div className="space-y-3 pt-1">
          {detectedObjects.map((obj, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{obj.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {obj.count}
                </span>
              </div>
              <div className="w-full bg-slate-200/70 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${obj.color}`}
                  style={{ width: `${obj.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity Bottom Grid */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <span className="text-sm font-bold text-slate-900 dark:text-white">Weekly Activity</span>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {weeklyActivity.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5"
            >
              <span className="text-lg font-black text-slate-900 dark:text-white block">
                {w.count}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {w.week} - detections
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
