import { useState, useCallback, useRef } from "react";

export function useSpeechGuidance(settings = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState("System ready. All sensors active.");
  const lastSpokenTimestamp = useRef(0);

  const {
    enabled = true,
    speechRate = 1.05,
    pitch = 1.0,
    volume = 1.0,
    hapticsEnabled = true,
  } = settings;

  const announce = useCallback(
    (message, priority = "MEDIUM") => {
      if (!message || !enabled) return;

      const now = Date.now();
      // Enforce minimum audio separation between rapid utterances unless CRITICAL
      if (priority !== "CRITICAL" && now - lastSpokenTimestamp.current < 1500) {
        return;
      }

      setLastAnnouncement(message);
      lastSpokenTimestamp.current = now;

      // Haptic feedback vibration for mobile
      if (hapticsEnabled && "vibrate" in navigator) {
        if (priority === "CRITICAL") {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } else if (priority === "HIGH") {
          navigator.vibrate([150, 75, 150]);
        } else {
          navigator.vibrate(60);
        }
      }

      // Voice output using Web Speech Synthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech immediately

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = speechRate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [enabled, speechRate, pitch, volume, hapticsEnabled]
  );

  const stopAudio = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    announce,
    stopAudio,
    isSpeaking,
    lastAnnouncement,
  };
}

