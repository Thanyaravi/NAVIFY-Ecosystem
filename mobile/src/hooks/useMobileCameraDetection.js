import { useEffect, useRef, useState, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { canie } from "../canie/canieEngine";

export function useMobileCameraDetection({
  videoRef,
  canvasRef,
  active,
  sensorContext = {},
  onCanieAlert,
  onDetectionsChange,
}) {
  const modelRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | running | stopped | error
  const [fps, setFps] = useState(0);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // environment | user
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Stop camera and loops cleanly
  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setStatus("stopped");
    setFps(0);
    canie.clearMemory();
  }, [canvasRef]);

  // Toggle flashlight / torch if supported by phone
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.getCapabilities) {
      const caps = track.getCapabilities();
      if (caps.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          console.warn("Torch failed", e);
        }
      }
    }
  }, [torchOn]);

  // Switch between front and rear cameras
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }

    let isCancelled = false;
    let frameCount = 0;
    let fpsTimestamp = Date.now();

    const COLORS = {
      box: "#6366f1",
      boxCritical: "#ef4444",
      bg: "rgba(15, 23, 42, 0.8)",
      text: "#ffffff",
    };

    const renderLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const model = modelRef.current;

      if (!video || !canvas || !model || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Sync canvas dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let rawPredictions = [];
      try {
        rawPredictions = await model.detect(video);
      } catch (e) {
        // Transient capture error
      }

      const fw = canvas.width || 1;
      const fh = canvas.height || 1;
      const parsedDetections = [];

      for (const p of rawPredictions) {
        if (p.score < 0.50) continue; // 50% confidence threshold

        const [x, y, w, h] = p.bbox;
        const confidence = Math.round(p.score * 100);
        const cx = x + w / 2;

        // Determine spatial direction
        const position =
          cx < fw * 0.35 ? "on your left" : cx > fw * 0.65 ? "on your right" : "straight ahead";

        // Determine distance/proximity estimate from vertical bounding box ratio
        const relHeight = h / fh;
        const proximity =
          relHeight > 0.62 ? "very close" : relHeight > 0.38 ? "close" : relHeight > 0.18 ? "nearby" : "far ahead";

        parsedDetections.push({
          label: p.class,
          confidence,
          position,
          proximity,
          bbox: p.bbox,
        });

        // Draw bounding boxes on canvas
        const isHazard = p.class === "stairs" || p.class === "car" || proximity === "very close";
        const strokeColor = isHazard ? COLORS.boxCritical : COLORS.box;

        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.stroke();

        // Draw pill label with distance/position
        const labelText = `${p.class} · ${proximity}`;
        ctx.font = "600 13px Inter, system-ui, sans-serif";
        const tw = ctx.measureText(labelText).width;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.roundRect(x, Math.max(0, y - 24), tw + 14, 22, 6);
        ctx.fill();

        ctx.fillStyle = COLORS.text;
        ctx.fillText(labelText, x + 7, Math.max(15, y - 8));
      }

      // Notify detections listener
      if (onDetectionsChange) {
        onDetectionsChange(parsedDetections);
      }

      // Pass parsed detections through CANIE Decision Engine
      const canieDecision = canie.evaluate(parsedDetections, sensorContext);
      if (canieDecision && onCanieAlert) {
        onCanieAlert(canieDecision);
      }

      // Update FPS counter
      frameCount += 1;
      const now = Date.now();
      if (now - fpsTimestamp >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimestamp = now;
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    const startCamera = async () => {
      try {
        setStatus("loading");
        setError("");

        // Lazy load MobileNet COCO-SSD
        if (!modelRef.current) {
          modelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        }

        if (isCancelled) return;

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities();
          setHasTorch(!!caps.torch);
        }

        setStatus("running");
        rafRef.current = requestAnimationFrame(renderLoop);
      } catch (err) {
        console.error("Camera startup error:", err);
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied. Please grant camera access in settings.");
        } else if (err.name === "NotFoundError") {
          setError("No video camera found on this device.");
        } else {
          setError(err.message || "Failed to start camera.");
        }
        setStatus("error");
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      stop();
    };
  }, [active, facingMode, stop, onCanieAlert, onDetectionsChange]);

  return {
    status,
    fps,
    error,
    hasTorch,
    torchOn,
    toggleTorch,
    switchCamera,
    stop,
  };
}
