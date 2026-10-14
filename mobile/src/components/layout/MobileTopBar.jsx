import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Navigation,
  Sun,
  Moon,
  Bell,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  User,
} from "lucide-react";

export function MobileTopBar() {
  const { role, setRole, telemetry, sosActive, setActiveTab } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [devPin, setDevPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleRoleToggle = () => {
    if (role === "user") {
      setShowRoleModal(true);
    } else {
      setRole("user");
      setActiveTab("dashboard");
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
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 px-4 py-3 safe-top transition-colors">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Logo & Brand matching Emergent */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-500/25">
              <Navigation className="h-4 w-4 fill-white rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                  NAVIFY
                </span>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  {role === "user" ? "Ecosystem" : "Company/Dev"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
                Assistive Mobile Console
              </p>
            </div>
          </div>

          {/* Right Action Icons: Theme Toggle, Notifications, User Avatar */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-amber-400 hover:scale-105 btn-press transition-all"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 fill-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:scale-105 btn-press transition-all"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-navy-950" />
            </button>

            {/* User Profile Avatar (Thanya C Ravi) */}
            <button
              onClick={handleRoleToggle}
              className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs shadow-sm transition-all btn-press ${
                role === "company"
                  ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400"
                  : "bg-gradient-to-tr from-brand-600 to-brand-500 text-white ring-2 ring-brand-400/40"
              }`}
              title={role === "company" ? "Company Mode (Tap to switch)" : "Thanya C Ravi (User Profile)"}
            >
              {role === "company" ? "DEV" : "T"}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-4 shadow-2xl border border-slate-200/80 dark:border-white/15">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Recent Notifications
              </span>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Smart Cane Paired
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Radxa ZERO 3W connected via Bluetooth 5.3 Low Latency.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Offline Sync Ready
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Local SQLite buffer synced with Cloud storage.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Passcode Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-slate-200/80 dark:border-white/15">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Company / Dev Portal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect RK3566 telemetry and CANIE logic
                </p>
              </div>
            </div>

            <form onSubmit={confirmDevPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Developer Passcode <span className="text-slate-400">(Default: 1234 or leave blank)</span>
                </label>
                <input
                  type="password"
                  value={devPin}
                  onChange={(e) => {
                    setDevPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-danger-500 mt-1">Incorrect passcode. Try 1234.</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold btn-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold btn-press shadow-md shadow-brand-500/20"
                >
                  Enter Dev Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

