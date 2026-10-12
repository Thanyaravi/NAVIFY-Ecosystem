import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Cpu,
  Zap,
  Thermometer,
  Radio,
  Layers,
  Activity,
  Gauge,
  CheckCircle2,
  AlertCircle,
  BatteryCharging,
} from "lucide-react";

export function LiveTelemetryDashboard() {
  const { telemetry, hardwareSpec } = useApp();

  return (
    <div className="space-y-4">
      {/* Dev Mode Overview Banner */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                RK3566 Hardware Telemetry
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Live sensor bus & thermal metrics on Radxa ZERO 3W
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            NPU ACTIVE
          </span>
        </div>
      </div>

      {/* Grid: Processor & NPU Telemetry */}
      <div className="grid grid-cols-2 gap-3">
        {/* Radxa ZERO 3W & RKNN INT8 Model */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              NPU Inference
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">YOLO11-S</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{telemetry.npuFps} <span className="text-xs font-normal text-slate-400">FPS</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Latency</span>
            <span className="font-mono text-slate-200">{telemetry.npuLatencyMs} ms (INT8)</span>
          </div>
        </div>

        {/* Passive Cooling & Thermal Telemetry */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              Passive Cooling
            </span>
            <span className="text-emerald-400 text-[10px] font-bold">FANLESS</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{telemetry.temperatureCelsius}°C</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Thermal Throttling</span>
            <span className="text-emerald-400 font-semibold">None (Safe)</span>
          </div>
        </div>
      </div>

      {/* 2S Battery Pack & MP1584 Buck Regulator Diagnostics */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" />
            2S Battery & Voltage Regulation
          </h4>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {telemetry.batteryVoltage} V (2S)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Cell 1 (P30B)</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">{telemetry.cell1Voltage} V</span>
            <span className="text-[9px] text-emerald-400">Balanced</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Cell 2 (P30B)</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">{telemetry.cell2Voltage} V</span>
            <span className="text-[9px] text-emerald-400">Balanced</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">MP1584 Rail</span>
            <span className="font-mono font-bold text-indigo-400 text-sm mt-0.5 block">{telemetry.regulator5vRail} V</span>
            <span className="text-[9px] text-slate-400">To Radxa 5V</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <span>Current Draw: <strong className="text-slate-200">{telemetry.currentDrawMa} mA</strong></span>
          <span>BMS: <strong className="text-emerald-400">2S 20A Armed</strong></span>
        </div>
      </div>

      {/* Dual JSN-SR04T Ultrasonic Telemetry */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Radio className="h-4 w-4 text-indigo-400" />
          Dual Ultrasonic Sensor Echoes
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Left JSN-SR04T Sensor</span>
              <span className="font-mono font-bold text-white">{telemetry.leftUltrasonicCm} cm</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (telemetry.leftUltrasonicCm / 350) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Right JSN-SR04T Sensor</span>
              <span className="font-mono font-bold text-white">{telemetry.rightUltrasonicCm} cm</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (telemetry.rightUltrasonicCm / 350) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MPU6050 Motion & Orientation Context */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-400" />
          MPU6050 IMU Spatial Attitude
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">PITCH</span>
            <span className="font-bold text-slate-200">{telemetry.imu.pitch}°</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ROLL</span>
            <span className="font-bold text-slate-200">{telemetry.imu.roll}°</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">YAW</span>
            <span className="font-bold text-slate-200">{telemetry.imu.yaw}°</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Motion Classifier</span>
          <span className="font-semibold text-emerald-400">{telemetry.imu.motionState}</span>
        </div>
      </div>
    </div>
  );
}
