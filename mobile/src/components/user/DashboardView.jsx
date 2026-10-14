import React from "react";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  BatteryCharging,
  ScanEye,
  ShieldCheck,
  Camera,
  Radio,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Play,
  Layers,
} from "lucide-react";

export function DashboardView() {
  const { telemetry, setActiveTab, liveDetections, hardwareSpec } = useApp();

  const metrics = [
    {
      id: "journey",
      label: "Journey Today",
      value: "2.4 km",
      change: "+18%",
      changeType: "up",
      icon: TrendingUp,
      accentColor: "text-brand-500 bg-brand-500/10",
    },
    {
      id: "battery",
      label: "Battery",
      value: `${telemetry.batteryPercentage}%`,
      change: "-4%",
      changeType: "down",
      icon: BatteryCharging,
      accentColor: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "detections",
      label: "AI Detections",
      value: "33",
      change: "+0 today",
      changeType: "neutral",
      icon: ScanEye,
      accentColor: "text-sky-500 bg-sky-500/10",
    },
    {
      id: "sos",
      label: "SOS Status",
      value: "Safe",
      change: "All clear",
      changeType: "safe",
      icon: ShieldCheck,
      accentColor: "text-emerald-500 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Greeting & Status Badges */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Good Evening, Thanya
        </p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          NAVIFY Ecosystem Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time AI-powered assistive navigation ecosystem.
        </p>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold glass-pill text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Smart Cane Connected
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold glass-pill text-brand-600 dark:text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Cloud Synced
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold glass-pill text-slate-700 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            YOLOv11 Active
          </span>
        </div>
      </div>

      {/* 4 Stat Cards in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="glass-card p-4 rounded-3xl flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {m.label}
                </span>
                <span className={`p-1.5 rounded-xl ${m.accentColor}`}>
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                  {m.value}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Camera Launch Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Live Camera</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full glass-pill text-slate-500 dark:text-slate-400">
            ● Standby
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-slate-100/70 dark:bg-navy-950/50 border border-slate-200/60 dark:border-white/5 flex flex-col items-center justify-center text-center py-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-3">
            Real-time YOLOv11 & MobileNet object detection with spoken voice guidance.
          </p>
          <button
            onClick={() => setActiveTab("live_monitor")}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/25 btn-press"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Launch Live Vision Monitor</span>
          </button>
        </div>
      </div>

      {/* Smart Cane Hardware Status Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Smart Cane Status</span>
          <button
            onClick={() => setActiveTab("smart_cane")}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View Details →
          </button>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Camera className="h-3.5 w-3.5 text-slate-400" />
              Camera (IMX219)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Radio className="h-3.5 w-3.5 text-slate-400" />
              Ultrasonic Sensor (Dual JSN-SR04T)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Radxa ZERO 3W (RK3566 NPU)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active (0.8 TOPS)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

