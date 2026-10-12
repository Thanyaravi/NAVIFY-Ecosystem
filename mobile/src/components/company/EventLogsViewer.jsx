import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ListCollapse,
  CloudUpload,
  CheckCircle2,
  Filter,
  Download,
  Clock,
  Sparkles,
  Database,
} from "lucide-react";

export function EventLogsViewer() {
  const { detectionLogs, offlineQueueCount, isSyncing, syncWithCloud, telemetry } = useApp();
  const [filterPriority, setFilterPriority] = useState("ALL");

  const filtered = detectionLogs.filter((log) => {
    if (filterPriority === "ALL") return true;
    return log.priority === filterPriority;
  });

  const exportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detectionLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `navify_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Offline SQLite Buffer & Cloud Sync Status */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                SQLite Local Buffer & Cloud Sync
              </h3>
              <p className="text-[11px] text-slate-400">
                Offline-first telemetry logging on MicroSD
              </p>
            </div>
          </div>

          <button
            onClick={syncWithCloud}
            disabled={isSyncing || offlineQueueCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold btn-tactile disabled:opacity-40"
          >
            <CloudUpload className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync to Cloud"}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400">Pending SQLite Records</span>
          <span className="font-mono font-bold text-amber-400">{offlineQueueCount} queued</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 flex-1 overflow-x-auto">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all btn-tactile ${
                filterPriority === p
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={exportLogs}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white btn-tactile"
          title="Export JSON Log"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl text-center text-xs text-slate-500">
            No events match selected filter.
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="glass-card p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    log.priority === "CRITICAL"
                      ? "bg-red-500"
                      : log.priority === "HIGH"
                      ? "bg-amber-400"
                      : "bg-indigo-400"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm capitalize">{log.label}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {log.position} · {log.proximity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-slate-200 font-semibold">{log.confidence}%</span>
                <span className="text-[10px] text-slate-500 block font-mono">{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
