import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

// Register Service Worker for offline PWA operation
if ("serviceWorker" in navigator && !window.location.host.includes("localhost:5173_disabled")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("NAVIFY Offline Service Worker Registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("SW Registration:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
