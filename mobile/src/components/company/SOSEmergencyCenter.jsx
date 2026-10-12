import React from "react";
import { useApp } from "../../context/AppContext";
import {
  AlertOctagon,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Activity,
} from "lucide-react";

export function SOSEmergencyCenter() {
  const { sosActive, sosEvents, resolveSOS, triggerSOS } = useApp();

  return (
    <div className="space-y-4">
      {/* Active Incident Alert Header */}
      {sosActive ? (
        <div className="glass-panel p-5 rounded-3xl border border-red-500 bg-red-950/60 shadow-2xl shadow-red-900/40 animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-red-600 text-white font-bold">
                <AlertOctagon className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  ACTIVE DISTRESS CALL DETECTED
                </h3>
                <p className="text-xs text-red-200">Emergency signal dispatched from top handle switch</p>
              </div>
            </div>
            <button
              onClick={() => resolveSOS(sosEvents[0]?.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 btn-tactile"
            >
              Resolve Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-4 rounded-3xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">SOS Dispatch Ready</h3>
              <p className="text-[11px] text-emerald-300/80">No unacknowledged emergency incidents</p>
            </div>
          </div>
        </div>
      )}

      {/* Incident Log Feed */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider px-1">
          Distress Incident History
        </h4>

        <div className="space-y-2.5">
          {sosEvents.map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      event.status === "ACTIVE" ? "bg-red-500 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                  <span className="font-bold text-white text-sm">{event.deviceId}</span>
                </div>
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

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.timestamp}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <MapPin className="h-3 w-3 text-indigo-400" />
                  {event.location}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                {event.resolutionNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
