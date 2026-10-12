import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  BatteryCharging,
  Radio,
  RefreshCw,
  Cpu,
  Camera,
  Layers,
  Thermometer,
  Zap,
  Volume2,
  CheckCircle2,
  BellRing,
  CloudUpload,
} from "lucide-react";

export function SmartCaneStatusCard({ onOpenFindCane }) {
  const { telemetry, hardwareSpec, offlineQueueCount, isSyncing, syncWithCloud } = useApp();
  const [buzzerActive, setBuzzerActive] = useState(false);

  const handleTriggerBuzzer = () => {
    setBuzzerActive(true);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setBuzzerActive(false), 3000);
  };

  const sensorList = [
    {
      id: "proc",
      label: "Edge AI Processor",
      value: hardwareSpec.processor.name,
      sub: `${hardwareSpec.processor.soc} · ${hardwareSpec.processor.npu}`,
      status: telemetry.radxaZeroStatus,
      icon: Cpu,
    },
    {
      id: "cam",
      label: "Vision Camera",
      value: hardwareSpec.camera.model,
      sub: `${hardwareSpec.camera.sensor} · ${telemetry.cameraFps} FPS`,
      status: telemetry.cameraStatus,
      icon: Camera,
    },
    {
      id: "prox",
      label: "Dual Proximity",
      value: "2 × JSN-SR04T Waterproof",
      sub: `L: ${(telemetry.leftUltrasonicCm / 100).toFixed(2)}m · R: ${(telemetry.rightUltrasonicCm / 100).toFixed(2)}m`,
      status: "online",
      icon: Radio,
    },
    {
      id: "imu",
      label: "Motion & Orientation",
      value: hardwareSpec.imu.model,
      sub: telemetry.imu.motionState,
      status: "online",
      icon: Layers,
    },
    {
      id: "cooling",
      label: "Thermal Management",
      value: "Passive (No Fan)",
      sub: `${telemetry.temperatureCelsius}°C · Thermal interface pad`,
      status: "normal",
      icon: Thermometer,
    },
    {
      id: "audio",
      label: "Voice Guidance Output",
      value: "Bluetooth 5.3",
      sub: "Low-latency Earpiece Paired",
      status: "online",
      icon: Volume2,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Battery & Health Hero Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          {/* Circular Battery Progress Graphic */}
          <div className="relative flex h-36 w-36 items-center justify-center mb-3">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-slate-800"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#batteryGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * telemetry.batteryPercentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="batteryGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {telemetry.batteryPercentage}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <BatteryCharging className="h-3 w-3" />
                2S Li-ion Pack
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">{hardwareSpec.deviceName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {hardwareSpec.serialNumber} · {telemetry.connectionType}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>2× 18650 P30B Series · {telemetry.batteryVoltage} V</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium">Est. 5h 15m runtime</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={handleTriggerBuzzer}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all btn-tactile ${
                buzzerActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
              }`}
            >
              <BellRing className={`h-4 w-4 ${buzzerActive ? "animate-bounce" : "text-amber-400"}`} />
              <span>{buzzerActive ? "Buzzer Ringing..." : "Sound Cane Buzzer"}</span>
            </button>

            <button
              onClick={syncWithCloud}
              disabled={isSyncing}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-indigo-500 btn-tactile disabled:opacity-50"
            >
              <CloudUpload className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : `Sync (${offlineQueueCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware & Sensor Components Breakdown */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Approved Hardware Components
          </h4>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All Active
          </span>
        </div>

        <div className="space-y-2.5">
          {sensorList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/70"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{item.label}</span>
                    <span className="text-[11px] font-medium text-slate-400 block">{item.value}</span>
                    <span className="text-[10px] text-slate-500">{item.sub}</span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
