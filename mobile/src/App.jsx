import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { MobileHeader } from "./components/layout/MobileHeader";
import { MobileNavigation } from "./components/layout/MobileNavigation";

// User Screens
import { CameraDetectionView } from "./components/user/CameraDetectionView";
import { SmartCaneStatusCard } from "./components/user/SmartCaneStatusCard";
import { SOSButton } from "./components/user/SOSButton";
import { VoiceSettingsModal } from "./components/user/VoiceSettingsModal";

// Company Screens
import { LiveTelemetryDashboard } from "./components/company/LiveTelemetryDashboard";
import { CANIEInspector } from "./components/company/CANIEInspector";
import { EventLogsViewer } from "./components/company/EventLogsViewer";
import { DeviceManager } from "./components/company/DeviceManager";
import { SOSEmergencyCenter } from "./components/company/SOSEmergencyCenter";

function MainContent() {
  const { role, activeTab } = useApp();

  return (
    <main className="flex-1 px-4 pt-3 pb-24 max-w-lg mx-auto w-full">
      {role === "user" ? (
        <>
          {activeTab === "navigation" && <CameraDetectionView />}
          {activeTab === "cane" && <SmartCaneStatusCard />}
          {activeTab === "sos" && <SOSButton />}
          {activeTab === "settings" && <VoiceSettingsModal />}
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
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <MobileHeader />
        <MainContent />
        <MobileNavigation />
      </div>
    </AppProvider>
  );
}
