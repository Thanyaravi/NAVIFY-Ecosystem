import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ShieldAlert,
  Shield,
  MapPin,
  ExternalLink,
  Phone,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export function SOSCenterView() {
  const { sosActive, triggerSOS, resolveSOS, sosEvents } = useApp();
  const [autoFallDetection, setAutoFallDetection] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [coords, setCoords] = useState("13.06475°, 77.59545°");
  const [accuracy, setAccuracy] = useState("±92 m");

  const contacts = [
    {
      id: "c1",
      initial: "V",
      name: "Vikram Sir",
      role: "Guide/Mentor",
      phone: "7875730893",
      email: "vikramadhithan.ac@saividya.ac.in",
    },
    {
      id: "c2",
      initial: "T",
      name: "Tejas P",
      role: "Friend",
      phone: "9535829902",
      email: "tejas.23aiml@saividya.ac.in",
    },
  ];

  const handleUpdateLocation = () => {
    setUpdatingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords(`${pos.coords.latitude.toFixed(5)}°, ${pos.coords.longitude.toFixed(5)}°`);
          setAccuracy(`±${Math.round(pos.coords.accuracy)} m`);
          setUpdatingLocation(false);
        },
        () => {
          setUpdatingLocation(false);
        },
        { timeout: 6000 }
      );
    } else {
      setTimeout(() => setUpdatingLocation(false), 1000);
    }
  };

  const handleTriggerSOS = () => {
    triggerSOS();
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("Emergency SOS dispatched. Caregivers alerted.");
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            SOS Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emergency contacts, live location and one-tap safety alerts.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            sosActive
              ? "bg-danger-500 text-white animate-pulse"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {sosActive ? "SOS ACTIVE" : "● All Safe"}
        </span>
      </div>

      {/* Main SOS Trigger Hero Card */}
      <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col items-center justify-center py-2">
          {/* Glowing Red Circular SOS Button */}
          <button
            onClick={handleTriggerSOS}
            disabled={sosActive}
            className={`relative group flex items-center justify-center h-44 w-44 rounded-full transition-all duration-300 btn-press ${
              sosActive
                ? "bg-danger-600 text-white shadow-glow-sos cursor-not-allowed"
                : "bg-gradient-to-tr from-rose-600 via-danger-500 to-rose-500 text-white shadow-glow-sos hover:scale-105 active:scale-95"
            }`}
          >
            {/* Outer pulse wave */}
            <span className="absolute inset-0 rounded-full border-4 border-rose-400/40 animate-ping pointer-events-none" />

            <div className="flex flex-col items-center">
              <Shield className="h-10 w-10 mb-1 drop-shadow" />
              <span className="text-2xl font-black tracking-wider">SOS</span>
            </div>
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            {sosActive
              ? "Emergency alert broadcast to primary contacts!"
              : "Press to alert your emergency contacts"}
          </p>

          {sosActive && (
            <button
              onClick={() => resolveSOS(sosEvents[0]?.id)}
              className="mt-3 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold btn-press shadow"
            >
              Mark Resolved · Cancel SOS
            </button>
          )}
        </div>

        {/* Auto Fall Detection Toggle Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-left">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Auto Fall Detection
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Uses motion sensors to fire an SOS automatically on a detected fall.
            </span>
          </div>

          <button
            onClick={() => setAutoFallDetection(!autoFallDetection)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              autoFallDetection ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                autoFallDetection ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Current Location Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Current Location
            </span>
          </div>

          <button
            onClick={handleUpdateLocation}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline btn-press"
          >
            <RefreshCw className={`h-3 w-3 ${updatingLocation ? "animate-spin" : ""}`} />
            <span>Update</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Current position</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white block">
                {coords}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Just now · Accuracy {accuracy}
            </span>

            <a
              href={`https://www.google.com/maps?q=${coords.replace("°", "").replace(" ", "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Open in Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Contacts</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Emails active · SMS pending (Twilio setup)
            </p>
          </div>
          <button className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center">
                  {c.initial}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {c.role} · {c.phone}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{c.email}</span>
                </div>
              </div>

              <a
                href={`tel:${c.phone}`}
                className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 btn-press"
                title="Call Contact"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* SOS History Card */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">SOS History</h3>

        <div className="space-y-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Manual Trigger</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Aug 02, 2026 · 04:29 PM
              </span>
              <span className="text-[10px] text-slate-400">MG Road, Bengaluru</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Resolved
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Fall Detected</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Jul 28, 2026 · 04:29 PM
              </span>
              <span className="text-[10px] text-slate-400">Indiranagar, Bengaluru</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
