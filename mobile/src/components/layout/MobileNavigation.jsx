import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Compass,
  Radio,
  AlertOctagon,
  Settings,
  Cpu,
  Brain,
  ListCollapse,
  Activity,
  Layers,
} from "lucide-react";

export function MobileNavigation() {
  const { role, activeTab, setActiveTab, sosActive } = useApp();

  const userTabs = [
    { id: "navigation", label: "Vision Nav", icon: Compass },
    { id: "cane", label: "Smart Cane", icon: Radio },
    { id: "sos", label: "Emergency", icon: AlertOctagon, alert: sosActive },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const companyTabs = [
    { id: "telemetry", label: "Telemetry", icon: Cpu },
    { id: "canie", label: "CANIE Engine", icon: Brain },
    { id: "logs", label: "Logs & Sync", icon: ListCollapse },
    { id: "devices", label: "Hardware", icon: Layers },
    { id: "emergencies", label: "SOS Queue", icon: AlertOctagon, alert: sosActive },
  ];

  const currentTabs = role === "user" ? userTabs : companyTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all btn-tactile relative ${
                isActive
                  ? role === "company"
                    ? "text-amber-400 font-semibold"
                    : "text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                {tab.alert && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[68px]">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className={`w-4 h-0.5 rounded-full mt-0.5 ${
                    role === "company" ? "bg-amber-400" : "bg-indigo-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
