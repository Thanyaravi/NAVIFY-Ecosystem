import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { MobileTopBar } from "./components/layout/MobileTopBar";
import { MobileTabBar } from "./components/layout/MobileTabBar";

// User Screens (Emergent layout optimized for mobile)
import { DashboardView } from "./components/user/DashboardView";
import { LiveMonitorView } from "./components/user/LiveMonitorView";
import { SmartCaneStatusCard } from "./components/user/SmartCaneStatusCard";
import { InsightsView } from "./components/user/InsightsView";
import { SOSCenterView } from "./components/user/SOSCenterView";

// Company Screens (Developer Diagnostics)
import { LiveTelemetryDashboard } from "./components/company/LiveTelemetryDashboard";
import { CANIEInspector } from "./components/company/CANIEInspector";
import { EventLogsViewer } from "./components/company/EventLogsViewer";
import { DeviceManager } from "./components/company/DeviceManager";
import { SOSEmergencyCenter } from "./components/company/SOSEmergencyCenter";

function MainContent() {
  const { role, activeTab } = useApp();

  return (
    <main className="flex-1 px-4 pt-4 pb-28 max-w-lg mx-auto w-full">
      {role === "user" ? (
        <>
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "live_monitor" && <LiveMonitorView />}
          {activeTab === "smart_cane" && <SmartCaneStatusCard />}
          {activeTab === "insights" && <InsightsView />}
          {activeTab === "sos_center" && <SOSCenterView />}
        </>
      ) : (
        <>
          {activeTab === "telemetry" && <LiveTelemetryDashboard />}
          {activeTab === "canie" && <CANIEInspector />}
          {activeTab === "logs" && <EventLogsViewer />}
          {activeTab === "devices" && <DeviceManager />}
          {activeTab === "emergencies" && <SOSEmergencyCenter />}
        </>
      )}
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <MobileTopBar />
        <MainContent />
        <MobileTabBar />
      </div>
    </AppProvider>
  );
}
