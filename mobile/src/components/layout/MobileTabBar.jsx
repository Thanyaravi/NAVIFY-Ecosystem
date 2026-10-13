import React from "react";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Camera,
  Radio,
  BarChart3,
  ShieldAlert,
  Cpu,
  Brain,
  ListCollapse,
  Layers,
  AlertOctagon,
} from "lucide-react";

export function MobileTabBar() {
  const { role, activeTab, setActiveTab, sosActive } = useApp();

  const userTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "live_monitor", label: "Live Monitor", icon: Camera },
    { id: "smart_cane", label: "Smart Cane", icon: Radio },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "sos_center", label: "SOS Center", icon: ShieldAlert, alert: sosActive },
  ];

  const companyTabs = [
    { id: "telemetry", label: "Telemetry", icon: Cpu },
    { id: "canie", label: "CANIE", icon: Brain },
    { id: "logs", label: "Logs", icon: ListCollapse },
    { id: "devices", label: "Hardware", icon: Layers },
    { id: "emergencies", label: "SOS Queue", icon: AlertOctagon, alert: sosActive },
  ];

  const currentTabs = role === "user" ? userTabs : companyTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/80 dark:border-white/10 px-2 py-1.5 safe-bottom transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all btn-press relative ${
                isActive
                  ? "text-brand-600 dark:text-brand-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                  }`}
                />
                {tab.alert && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-3.5 h-0.5 rounded-full mt-0.5 bg-brand-500 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
