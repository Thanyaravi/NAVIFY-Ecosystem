import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Radio,
  Share2,
} from "lucide-react";

export function SOSButton() {
  const { sosActive, triggerSOS, resolveSOS, sosEvents, hardwareSpec } = useApp();
  const [pressProgress, setPressProgress] = useState(0);

  const handlePressSOS = () => {
    triggerSOS();
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("Emergency SOS activated. Caregivers alerted.");
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div
        className={`glass-panel p-5 rounded-3xl border text-center transition-all ${
          sosActive
            ? "border-red-500 bg-red-950/50 shadow-2xl shadow-red-900/40 animate-pulse"
            : "border-slate-800 bg-slate-900/60"
        }`}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
            sosActive
              ? "bg-red-500 text-white animate-bounce"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {sosActive ? "EMERGENCY BROADCAST ACTIVE" : "SOS SAFETY SYSTEM ARMED"}
        </span>

        <h3 className="text-xl font-extrabold text-white mt-3 tracking-tight">
          {sosActive ? "Emergency Alert Dispatched" : "Instant Emergency Assistance"}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {sosActive
            ? "Your exact GPS location and smart cane status have been transmitted to your primary contacts."
            : "Press the red button below or click the top-mounted tactile SOS button on the cane handle."}
        </p>
      </div>

      {/* Giant Tactile SOS Button */}
      <div className="flex flex-col items-center justify-center py-4">
        <button
          onClick={handlePressSOS}
          disabled={sosActive}
          className={`relative group flex items-center justify-center h-48 w-48 rounded-full transition-all duration-300 btn-tactile ${
            sosActive
              ? "bg-red-700 text-white shadow-2xl shadow-red-600/60 cursor-not-allowed"
              : "bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white shadow-2xl shadow-red-500/40 hover:scale-105 active:scale-95"
          }`}
        >
          {/* Animated Glow Rings */}
          <span className="absolute inset-0 rounded-full border-4 border-red-400/30 animate-ping pointer-events-none" />
          <span className="absolute -inset-3 rounded-full border border-red-500/20 pointer-events-none" />

          <div className="flex flex-col items-center">
            <AlertOctagon className="h-16 w-16 mb-2 drop-shadow-md" />
            <span className="text-2xl font-black tracking-wider">SOS</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-red-100/90 mt-0.5">
              {sosActive ? "DISPATCHED" : "TAP TO ALERT"}
            </span>
          </div>
        </button>

        {sosActive && (
          <button
            onClick={() => resolveSOS(sosEvents[0]?.id)}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold tracking-wider uppercase btn-tactile"
          >
            I am Safe · Cancel Alert
          </button>
        )}
      </div>

      {/* Emergency Contacts & Caregiver Status */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Automated Emergency Sequence
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">GPS Geolocation</span>
                <span className="text-[11px] text-slate-400">12.9716° N, 77.5946° E · Captured</span>
              </div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Primary Caregiver</span>
                <span className="text-[11px] text-slate-400">SMS & Push Notification Ready</span>
              </div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Top-Mounted Cane Button</span>
                <span className="text-[11px] text-slate-400">Hardware Momentary Switch Sync</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ARMED
            </span>
          </div>
        </div>
      </div>

      {/* Incident History Log */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 px-1">
          Recent Safety Incident Logs
        </h4>

        <div className="space-y-2">
          {sosEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {event.timestamp}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    event.status === "ACTIVE"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{event.location}</p>
              <p className="text-[10px] text-slate-500">{event.resolutionNote}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

