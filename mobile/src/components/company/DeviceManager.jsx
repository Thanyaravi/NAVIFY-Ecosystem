import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Layers,
  Wrench,
  Wifi,
  Bluetooth,
  RefreshCw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
} from "lucide-react";

export function DeviceManager() {
  const { hardwareSpec, telemetry, setTelemetry } = useApp();
  const [calibrating, setCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const handleCalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrated(true);
      setTelemetry((prev) => ({
        ...prev,
        imu: {
          ...prev.imu,
          pitch: 0.0,
          roll: 0.0,
        },
      }));
      setTimeout(() => setCalibrated(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Cane Hardware Identity */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              PHYSICAL HARDWARE SPEC
            </span>
            <h3 className="text-base font-bold text-white mt-1">{hardwareSpec.deviceName}</h3>
            <p className="text-xs text-slate-400 font-mono">
              S/N: {hardwareSpec.serialNumber} · FW: {hardwareSpec.firmwareVersion}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 text-indigo-400 border border-slate-800">
            <Cpu className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Sensor Calibration Bench */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-indigo-400" />
            Sensor Zero-Point Calibration
          </h4>
          {calibrated && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tare Successful
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Hold the cane vertical on a flat surface to tare MPU6050 gyroscope and align JSN-SR04T dual baseline.
        </p>

        <button
          onClick={handleCalibrate}
          disabled={calibrating}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 btn-tactile disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${calibrating ? "animate-spin" : ""}`} />
          <span>{calibrating ? "Calibrating IMU & Ultrasonics..." : "Tare & Calibrate Sensors"}</span>
        </button>
      </div>

      {/* Connectivity Management */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Wireless Interfaces
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Bluetooth className="h-4 w-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-white block">Bluetooth 5.3 Low Energy</span>
                <span className="text-[10px] text-slate-400">Audio Earpiece & Companion Link</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              CONNECTED
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white block">Wi-Fi (802.11 b/g/n)</span>
                <span className="text-[10px] text-slate-400">Radxa Direct Cloud Sync</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

