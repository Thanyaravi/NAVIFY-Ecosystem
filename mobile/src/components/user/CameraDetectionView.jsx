import React, { useRef, useState, useCallback, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useMobileCameraDetection } from "../../hooks/useMobileCameraDetection";
import { useSpeechGuidance } from "../../hooks/useSpeechGuidance";
import {
  Camera,
  CameraOff,
  Flashlight,
  RefreshCw,
  Volume2,
  VolumeX,
  Gauge,
  Scan,
  ShieldAlert,
  Radio,
  Eye,
  Sliders,
} from "lucide-react";

export function CameraDetectionView({ onOpenSettings }) {
  const {
    detectionSource,
    setDetectionSource,
    telemetry,
    logDetection,
    currentGuidance,
    setCurrentGuidance,
    settings,
  } = useApp();

  const [active, setActive] = useState(true);
  const [liveDetections, setLiveDetections] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Speech Guidance Hook
  const { announce, stopAudio, isSpeaking, lastAnnouncement } = useSpeechGuidance({
    enabled: settings.speechEnabled,
    speechRate: settings.speechRate,
    speechVolume: settings.speechVolume,
    hapticsEnabled: settings.hapticsEnabled,
  });

  // Handle CANIE Guidance decision
  const handleCanieAlert = useCallback(
    (decision) => {
      setCurrentGuidance(decision);
      announce(decision.message, decision.priority);
      logDetection(decision);
    },
    [announce, logDetection, setCurrentGuidance]
  );

  // Hook for live mobile camera ML detection with MobileNet COCO-SSD
  const {
    status,
    fps,
    error,
    hasTorch,
    torchOn,
    toggleTorch,
    switchCamera,
    stop,
  } = useMobileCameraDetection({
    videoRef,
    canvasRef,
    active: active && detectionSource === "mobile_camera",
    sensorContext: {
      leftUltrasonicCm: telemetry.leftUltrasonicCm,
      rightUltrasonicCm: telemetry.rightUltrasonicCm,
      imuMotionState: telemetry.imu.motionState,
    },
    onCanieAlert: handleCanieAlert,
    onDetectionsChange: setLiveDetections,
  });

  return (
    <div className="space-y-4">
      {/* Top Source Switcher: Phone Camera vs Physical Cane */}
      <div className="glass-card p-1.5 rounded-2xl flex items-center justify-between border border-slate-800">
        <button
          onClick={() => setDetectionSource("mobile_camera")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all btn-tactile ${
            detectionSource === "mobile_camera"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Phone Camera Mode</span>
        </button>

        <button
          onClick={() => setDetectionSource("physical_cane")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all btn-tactile ${
            detectionSource === "physical_cane"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Smart Cane Stream</span>
        </button>
      </div>

      {/* Main CANIE Guidance Banner (High Visibility & Audio Feedback) */}
      <div
        className={`glass-panel p-4 rounded-2xl border transition-all ${
          currentGuidance.priority === "CRITICAL"
            ? "border-red-500/70 bg-red-950/40 shadow-lg shadow-red-900/20"
            : currentGuidance.priority === "HIGH"
            ? "border-amber-500/60 bg-amber-950/30"
            : "border-indigo-500/40 bg-slate-900/80"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                currentGuidance.priority === "CRITICAL"
                  ? "bg-red-500 text-white animate-pulse"
                  : currentGuidance.priority === "HIGH"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-indigo-600 text-white"
              }`}
            >
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CANIE Audio Guidance
                </span>
                {isSpeaking && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Speaking...
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-white tracking-tight mt-0.5">
                {currentGuidance.message || "Path is clear. Proceed with caution."}
              </p>
            </div>
          </div>

          <button
            onClick={() => announce(currentGuidance.message || "Path is clear.", "HIGH")}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white btn-tactile"
            title="Replay guidance audio"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Camera Video & Detection Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-[4/3] max-h-[380px] flex items-center justify-center">
        {detectionSource === "mobile_camera" ? (
          <>
            {/* Hidden video stream element feeding canvas */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
            />
            {/* Canvas displaying bounding boxes & HUD */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover rounded-3xl"
            />

            {/* Loading / Status Overlay */}
            {status === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Starting Vision Engine...</p>
                <p className="text-xs text-slate-400 mt-1">Loading MobileNet Edge Model</p>
              </div>
            )}

            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center z-20">
                <ShieldAlert className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-sm font-bold text-white">Camera Access Error</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
                <button
                  onClick={() => setActive(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold btn-tactile"
                >
                  Retry Camera Permission
                </button>
              </div>
            )}

            {/* On-Screen HUD Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-200">
              <Scan className="h-3.5 w-3.5 text-indigo-400" />
              <span>{fps} FPS</span>
              <span className="text-slate-600">·</span>
              <span>{liveDetections.length} objects</span>
            </div>

            {/* Camera Control Buttons */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all btn-tactile ${
                    torchOn
                      ? "bg-amber-400 text-slate-950 border-amber-300"
                      : "bg-slate-900/80 text-white border-slate-700/80"
                  }`}
                  title="Toggle Torch"
                >
                  <Flashlight className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={switchCamera}
                className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white btn-tactile"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActive(!active)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all btn-tactile ${
                  active
                    ? "bg-slate-900/80 text-white border-slate-700/80"
                    : "bg-red-500/80 text-white border-red-400"
                }`}
                title={active ? "Pause Video" : "Resume Video"}
              >
                {active ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </button>
            </div>
          </>
        ) : (
          /* Physical Cane IMX219 Stream View */
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Eye className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Radxa IMX219 Forward Camera</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Receiving YOLO11-S INT8 detection stream from Radxa ZERO 3W NPU.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>Resolution: 8 MP (IMX219)</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">NPU Active (18.4 FPS)</span>
            </div>
          </div>
        )}
      </div>

      {/* Ultrasonic Distance Clearance Radar (Left vs Right) */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-indigo-400" />
            Dual JSN-SR04T Ultrasonic Clearance
          </span>
          <span className="text-[11px] text-slate-500">Waterproof Dual Array</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Left Sensor */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Left Sensor</span>
              <span className="font-semibold text-slate-200">
                {(telemetry.leftUltrasonicCm / 100).toFixed(2)} m
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  telemetry.leftUltrasonicCm < 80
                    ? "bg-red-500"
                    : telemetry.leftUltrasonicCm < 150
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(100, (telemetry.leftUltrasonicCm / 300) * 100)}%` }}
              />
            </div>
          </div>

          {/* Right Sensor */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Right Sensor</span>
              <span className="font-semibold text-slate-200">
                {(telemetry.rightUltrasonicCm / 100).toFixed(2)} m
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  telemetry.rightUltrasonicCm < 80
                    ? "bg-red-500"
                    : telemetry.rightUltrasonicCm < 150
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(100, (telemetry.rightUltrasonicCm / 300) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Detected Obstacles List */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
          Current Detected Objects ({liveDetections.length})
        </h4>

        {liveDetections.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No obstacles currently in path. Walking field clear.
          </p>
        ) : (
          <div className="space-y-2">
            {liveDetections.map((d, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      d.proximity === "very close"
                        ? "bg-red-500 animate-ping"
                        : d.proximity === "close"
                        ? "bg-amber-400"
                        : "bg-indigo-400"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-semibold text-white capitalize">{d.label}</span>
                    <p className="text-[11px] text-slate-400">
                      {d.position} · {d.proximity}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {d.confidence}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
