import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { canie, OBSTACLE_PRIORITIES } from "../../canie/canieEngine";
import {
  Brain,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ListFilter,
} from "lucide-react";

export function CANIEInspector() {
  const { currentGuidance, setCurrentGuidance, logDetection } = useApp();
  const [cooldownSec, setCooldownSec] = useState(4.5);
  const [testLabel, setTestLabel] = useState("stairs");
  const [testPosition, setTestPosition] = useState("straight ahead");
  const [testProximity, setTestProximity] = useState("very close");

  const runSimulatedDecision = () => {
    const mockDet = [
      {
        label: testLabel,
        confidence: 94,
        position: testPosition,
        proximity: testProximity,
      },
    ];

    const decision = canie.evaluate(mockDet, { leftUltrasonicCm: 140, rightUltrasonicCm: 160 });
    if (decision) {
      setCurrentGuidance(decision);
      logDetection(decision);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(decision.message);
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    }
  };

  const resetCanieMemory = () => {
    canie.clearMemory();
    setCurrentGuidance({
      message: "Memory cleared. Next detection will trigger immediately.",
      priority: "LOW",
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">CANIE Decision Engine</h3>
              <p className="text-[11px] text-amber-300/80">Context-Aware Rule & Obstacle Memory Inspector</p>
            </div>
          </div>
          <button
            onClick={resetCanieMemory}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white btn-tactile"
            title="Reset obstacle memory buffer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Cache</span>
          </button>
        </div>
      </div>

      {/* Live Active Guidance Banner */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Decision Output
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentGuidance.priority === "CRITICAL"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : currentGuidance.priority === "HIGH"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-indigo-500/20 text-indigo-300"
            }`}
          >
            {currentGuidance.priority}
          </span>
        </div>
        <p className="text-sm font-bold text-white font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
          "{currentGuidance.message}"
        </p>
      </div>

      {/* Decision Simulator Test Bench */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Play className="h-4 w-4 text-amber-400 fill-current" />
          CANIE Perception Testbench
        </h4>
        <p className="text-xs text-slate-400">
          Inject synthetic detections to verify repeat-suppression and prioritization rules.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Obstacle</label>
            <select
              value={testLabel}
              onChange={(e) => setTestLabel(e.target.value)}
              className="w-full text-xs bg-slate-900 text-white rounded-xl border border-slate-700 p-2"
            >
              <option value="stairs">Stairs (Critical)</option>
              <option value="car">Car (Critical)</option>
              <option value="person">Person (High)</option>
              <option value="door">Door (High)</option>
              <option value="chair">Chair (Medium)</option>
              <option value="bottle">Bottle (Low)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Direction</label>
            <select
              value={testPosition}
              onChange={(e) => setTestPosition(e.target.value)}
              className="w-full text-xs bg-slate-900 text-white rounded-xl border border-slate-700 p-2"
            >
              <option value="on your left">Left</option>
              <option value="straight ahead">Ahead</option>
              <option value="on your right">Right</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Proximity</label>
            <select
              value={testProximity}
              onChange={(e) => setTestProximity(e.target.value)}
              className="w-full text-xs bg-slate-900 text-white rounded-xl border border-slate-700 p-2"
            >
              <option value="very close">Very Close</option>
              <option value="close">Close</option>
              <option value="nearby">Nearby</option>
              <option value="far ahead">Far Ahead</option>
            </select>
          </div>
        </div>

        <button
          onClick={runSimulatedDecision}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 btn-tactile"
        >
          <Brain className="h-4 w-4" />
          <span>Evaluate Decision & Speak</span>
        </button>
      </div>

      {/* Priority Hierarchy Reference Table */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Obstacle Priority Hierarchy
        </h4>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="font-semibold text-red-300">CRITICAL (Top Priority)</span>
            <span className="text-slate-400">Staircase, Vehicles, Sudden drops</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="font-semibold text-amber-300">HIGH (Path Obstruction)</span>
            <span className="text-slate-400">Person, Wall, Door, Bicycle</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="font-semibold text-indigo-300">MEDIUM (Indoor Items)</span>
            <span className="text-slate-400">Chair, Table, Bed, Furniture</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="font-semibold text-slate-400">LOW (Suppressed unless close)</span>
            <span className="text-slate-500">Backpack, Bottle, Handbag</span>
          </div>
        </div>
      </div>
    </div>
  );
}
