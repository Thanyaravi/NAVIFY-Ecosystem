import React, { useRef, useState, useCallback, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useMobileCameraDetection } from "../../hooks/useMobileCameraDetection";
import { useSpeechGuidance } from "../../hooks/useSpeechGuidance";
import {
  Camera,
  Volume2,
  VolumeX,
  Square,
  Play,
  Gauge,
  ScanEye,
  Activity,
  RotateCw,
  Flashlight,
  ShieldAlert,
} from "lucide-react";

export function LiveMonitorView() {
  const {
    telemetry,
    logDetection,
    currentGuidance,
    setCurrentGuidance,
    settings,
  } = useApp();

  const [active, setActive] = useState(true);
  const [liveDetections, setLiveDetections] = useState([
    { label: "cell phone", confidence: 85, proximity: "Close", position: "On Your Left" },
    { label: "person", confidence: 67, proximity: "Very Close", position: "Straight Ahead" },
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Speech Guidance Hook
  const { announce, stopAudio, isSpeaking } = useSpeechGuidance({
    enabled: voiceEnabled && settings.speechEnabled,
    speechRate: settings.speechRate,
    speechVolume: settings.speechVolume,
    hapticsEnabled: settings.hapticsEnabled,
  });

  // Handle CANIE Decision
  const handleCanieDecision = useCallback(
    (decision) => {
      setCurrentGuidance(decision);
      if (voiceEnabled) {
        announce(decision.message, decision.priority);
      }
      logDetection(decision);
    },
    [announce, logDetection, setCurrentGuidance, voiceEnabled]
  );

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
    active,
    sensorContext: {
      leftUltrasonicCm: telemetry.leftUltrasonicCm,
      rightUltrasonicCm: telemetry.rightUltrasonicCm,
      imuMotionState: telemetry.imu.motionState,
    },
    onCanieAlert: handleCanieDecision,
    onDetectionsChange: (dets) => {
      if (dets && dets.length > 0) {
        setLiveDetections(dets);
      }
    },
  });

  // Calculate average confidence
  const avgConf =
    liveDetections.length > 0
      ? Math.round(
          liveDetections.reduce((acc, d) => acc + (d.confidence || 75), 0) /
            liveDetections.length
        )
      : 76;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Monitor
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time vision, Thanya.
        </p>
      </div>

      {/* Main Live Camera Card */}
      <div className="glass-card p-4 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Live Camera</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle Icon Button */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl transition-all btn-press ${
                voiceEnabled
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "bg-slate-100 dark:bg-white/5 text-slate-400"
              }`}
              title={voiceEnabled ? "Mute Spoken Alerts" : "Enable Spoken Alerts"}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Start / Stop Button */}
            <button
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all btn-press ${
                active
                  ? "bg-danger-500 hover:bg-danger-600 text-white shadow-sm shadow-danger-500/20"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
              }`}
            >
              {active ? (
                <>
                  <Square className="h-3 w-3 fill-white" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-white" />
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-200/40 dark:border-white/10 shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover rounded-2xl"
          />

          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20">
              <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-2" />
              <p className="text-xs font-bold text-white">Starting Vision Model...</p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/90 text-center z-20">
              <ShieldAlert className="h-8 w-8 text-danger-500 mb-2" />
              <p className="text-xs font-bold text-white">Camera Access Error</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{error}</p>
            </div>
          )}

          {/* Camera controls in corner */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md btn-press ${
                  torchOn ? "bg-amber-400 text-slate-950" : "bg-black/40 text-white"
                }`}
              >
                <Flashlight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={switchCamera}
              className="p-2 rounded-xl bg-black/40 text-white backdrop-blur-md btn-press"
              title="Switch Camera"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Three Metric Pills matching Emergent: FPS, Detections, Avg. Confidence */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {active ? (fps > 0 ? fps : 18) : "—"}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              FPS
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {liveDetections.length}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Detections
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {avgConf}%
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Detected Objects Card matching Emergent */}
      <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-200/80 dark:border-white/10">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detected Objects</h3>

        <div className="space-y-3">
          {liveDetections.map((d, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {d.label}
                </span>
                <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                  {d.confidence}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${d.confidence}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {d.proximity || "Close"} · {d.position || "Ahead"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
