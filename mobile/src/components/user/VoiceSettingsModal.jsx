import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Volume2,
  Gauge,
  Vibrate,
  Sliders,
  Sparkles,
  Eye,
  Check,
  Play,
} from "lucide-react";

export function VoiceSettingsModal() {
  const { settings, setSettings } = useApp();

  const handleSpeechTest = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const testPhrase =
        "Testing NAVIFY CANIE audio guidance. Person approaching ahead. Obstacle on your right, move slightly left.";
      const u = new SpeechSynthesisUtterance(testPhrase);
      u.rate = settings.speechRate;
      u.volume = settings.speechVolume;
      window.speechSynthesis.speak(u);
    }
    if (settings.hapticsEnabled && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5 rounded-3xl border border-slate-800">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-400" />
          Accessibility & Guidance Preferences
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Customize spoken announcements and vibration warnings for optimal mobility.
        </p>

        {/* Speech Rate Slider */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-indigo-400" />
              Speech Rate / Speed
            </span>
            <span className="font-bold text-indigo-400">{settings.speechRate.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.50"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, speechRate: parseFloat(e.target.value) }))
            }
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Slower (0.75×)</span>
            <span>Standard (1.0×)</span>
            <span>Fast (1.5×)</span>
          </div>
        </div>

        {/* Speech Volume Slider */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
              Voice Volume
            </span>
            <span className="font-bold text-indigo-400">
              {Math.round(settings.speechVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={settings.speechVolume}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, speechVolume: parseFloat(e.target.value) }))
            }
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Haptics Toggle */}
        <div className="mt-6 flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Vibrate className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Haptic Vibration</span>
              <span className="text-[11px] text-slate-400">Tactile pulses for close obstacles</span>
            </div>
          </div>
          <button
            onClick={() =>
              setSettings((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }))
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.hapticsEnabled ? "bg-indigo-600" : "bg-slate-800"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.hapticsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Test Speech Button */}
        <button
          onClick={handleSpeechTest}
          className="mt-5 w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 btn-tactile"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Play Sample Guidance Voice</span>
        </button>
      </div>

      {/* Detection Sensitivity Selection */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Obstacle Sensitivity Threshold
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {["relaxed", "standard", "sensitive"].map((level) => {
            const isSelected = settings.obstacleSensitivity === level;
            return (
              <button
                key={level}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, obstacleSensitivity: level }))
                }
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all btn-tactile ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
