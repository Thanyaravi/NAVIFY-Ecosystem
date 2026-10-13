import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_TELEMETRY, NAVIFY_HARDWARE_SPEC } from "../types/navifyHardware";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Role: "user" (Visually Impaired / Caregiver) | "company" (Developer / Admin)
  const [role, setRole] = useState("user");

  // Navigation tab matching Emergent
  const [activeTab, setActiveTab] = useState("dashboard");

  // Detection source: "mobile_camera" (Phone camera) | "physical_cane" (Radxa Cane)
  const [detectionSource, setDetectionSource] = useState("mobile_camera");

  // Cane telemetry (reflects real hardware or simulation of Radxa ZERO 3W)
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);

  // Live and historical detections
  const [liveDetections, setLiveDetections] = useState([]);
  const [detectionLogs, setDetectionLogs] = useState([
    {
      id: "det-101",
      timestamp: "14:42:10",
      label: "Person",
      confidence: 91,
      position: "straight ahead",
      proximity: "nearby",
      priority: "HIGH",
      source: "Camera",
    },
    {
      id: "det-100",
      timestamp: "14:41:45",
      label: "Chair",
      confidence: 88,
      position: "on your right",
      proximity: "close",
      priority: "MEDIUM",
      source: "Camera",
    },
  ]);

  // CANIE decision guidance
  const [currentGuidance, setCurrentGuidance] = useState({
    message: "Path is clear. Proceed straight.",
    priority: "LOW",
    timestamp: Date.now(),
  });

  // SOS Emergency State
  const [sosActive, setSosActive] = useState(false);
  const [sosEvents, setSosEvents] = useState([
    {
      id: "sos-init-1",
      timestamp: "Yesterday, 18:22",
      deviceId: "NAVIFY-RK3566-9041",
      location: "12.9716° N, 77.5946° E",
      status: "RESOLVED",
      resolutionNote: "Routine drill test by caregiver",
    },
  ]);

  // User accessibility and voice settings
  const [settings, setSettings] = useState({
    speechEnabled: true,
    speechRate: 1.05,
    speechVolume: 1.0,
    hapticsEnabled: true,
    obstacleSensitivity: "standard", // relaxed | standard | sensitive
    highContrast: true,
    alertDistanceMeters: 2.5,
  });

  // Offline SQLite queue & Firebase Cloud status
  const [offlineQueueCount, setOfflineQueueCount] = useState(4);
  const [isSyncing, setIsSyncing] = useState(false);

  // Trigger SOS Emergency
  const triggerSOS = useCallback(async () => {
    setSosActive(true);

    let locationCoords = "Location acquired: 12.9716° N, 77.5946° E";
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locationCoords = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
        },
        () => {},
        { timeout: 5000 }
      );
    }

    if ("vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    const newEvent = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      deviceId: NAVIFY_HARDWARE_SPEC.serialNumber,
      location: locationCoords,
      status: "ACTIVE",
      resolutionNote: "Alert broadcast to emergency contacts & NAVIFY Console.",
    };

    setSosEvents((prev) => [newEvent, ...prev]);
    setOfflineQueueCount((c) => c + 1);
  }, []);

  const resolveSOS = useCallback((eventId) => {
    setSosEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "RESOLVED", resolvedAt: new Date().toLocaleTimeString() } : e))
    );
    setSosActive(false);
  }, []);

  // Sync offline records with Firebase Cloud
  const syncWithCloud = useCallback(async () => {
    if (offlineQueueCount === 0) return;
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOfflineQueueCount(0);
    setTelemetry((prev) => ({ ...prev, lastSyncTime: "Just now", offlineLogsPending: 0 }));
    setIsSyncing(false);
  }, [offlineQueueCount]);

  // Log a new detection to session history
  const logDetection = useCallback((detection) => {
    const logItem = {
      id: `det-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      label: detection.label,
      confidence: detection.confidence,
      position: detection.position,
      proximity: detection.proximity,
      priority: detection.priority || "MEDIUM",
      source: detectionSource === "mobile_camera" ? "Phone Cam" : "IMX219 (Cane)",
    };
    setDetectionLogs((prev) => [logItem, ...prev.slice(0, 49)]); // Keep last 50
    setOfflineQueueCount((c) => c + 1);
  }, [detectionSource]);

  // Ambient sensor jitter simulation for realistic telemetry testing
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Small fluctuation around passive cooling steady-state
        const tempDelta = (Math.random() - 0.5) * 0.4;
        const leftDelta = Math.floor((Math.random() - 0.5) * 6);
        const rightDelta = Math.floor((Math.random() - 0.5) * 6);
        const currentDelta = Math.floor((Math.random() - 0.5) * 15);

        return {
          ...prev,
          temperatureCelsius: +(prev.temperatureCelsius + tempDelta).toFixed(1),
          leftUltrasonicCm: Math.max(30, Math.min(350, prev.leftUltrasonicCm + leftDelta)),
          rightUltrasonicCm: Math.max(30, Math.min(350, prev.rightUltrasonicCm + rightDelta)),
          currentDrawMa: Math.max(480, Math.min(680, prev.currentDrawMa + currentDelta)),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        detectionSource,
        setDetectionSource,
        telemetry,
        setTelemetry,
        liveDetections,
        setLiveDetections,
        detectionLogs,
        logDetection,
        currentGuidance,
        setCurrentGuidance,
        sosActive,
        setSosActive,
        triggerSOS,
        resolveSOS,
        sosEvents,
        settings,
        setSettings,
        offlineQueueCount,
        isSyncing,
        syncWithCloud,
        hardwareSpec: NAVIFY_HARDWARE_SPEC,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

