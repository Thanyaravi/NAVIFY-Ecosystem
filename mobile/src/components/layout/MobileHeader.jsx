import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Shield, Sparkles, BatteryCharging, Radio, Wrench, UserCheck, AlertTriangle } from "lucide-react";

export function MobileHeader() {
  const { role, setRole, telemetry, sosActive, setActiveTab } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [devPin, setDevPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleRoleSwitch = () => {
    if (role === "user") {
      // Prompt for quick pin check for developer mode (default PIN: 1234 or direct switch)
      setShowRoleModal(true);
    } else {
      setRole("user");
      setActiveTab("navigation");
    }
  };

  const confirmDevPin = (e) => {
    e.preventDefault();
    if (devPin === "1234" || devPin === "") {
      setRole("company");
      setActiveTab("telemetry");
      setShowRoleModal(false);
      setDevPin("");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 safe-top">
        <div className="flex items-center justify-between">
          {/* Logo & Ecosystem Badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">NAVIFY</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {role === "user" ? "CONNECT" : "COMPANY / DEV"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Edge AI Assistive Ecosystem</p>
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2">
            {/* SOS Active Warning if triggered */}
            {sosActive && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>SOS ACTIVE</span>
              </div>
            )}

            {/* Cane Battery Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">{telemetry.batteryPercentage}%</span>
            </div>

            {/* Role Switcher Pill */}
            <button
              onClick={handleRoleSwitch}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border btn-tactile ${
                role === "company"
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : "bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="Switch user / developer mode"
            >
              {role === "company" ? (
                <>
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Dev Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>User View</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Developer PIN / Mode Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Company / Dev Portal</h3>
                <p className="text-xs text-slate-400">Unlock hardware telemetry & CANIE rule engine</p>
              </div>
            </div>

            <form onSubmit={confirmDevPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Developer Passcode <span className="text-slate-500">(Default: 1234 or leave blank)</span>
                </label>
                <input
                  type="password"
                  value={devPin}
                  onChange={(e) => {
                    setDevPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 1234"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-400 mt-1">Incorrect passcode. Try 1234.</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 btn-tactile"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm btn-tactile"
                >
                  Enter Dev Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

