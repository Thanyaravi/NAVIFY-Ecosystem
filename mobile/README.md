# NAVIFY Connect — Mobile Companion Application

NAVIFY Connect is the cross-platform mobile application for the **NAVIFY Assistive Navigation Ecosystem**. It operates free from proprietary dependencies (such as Emergent) and is fully self-hosted, modular, and open-source.

---

## 🚀 Key Features

### 1. Dual-Role Architecture
- **User Mode (Visually Impaired & Caregivers)**:
  - High-contrast, tactile, accessible design.
  - **Phone Camera Vision Mode**: Uses the smartphone's camera to run real-time object detection and CANIE navigation guidance directly on the phone without requiring physical hardware immediately.
  - **Smart Cane Link Mode**: Displays live status of the physical NAVIFY Cane (Radxa ZERO 3W, 2S 18650 P30B battery telemetry, dual JSN-SR04T ultrasonic radar, MPU6050 motion state).
  - **Emergency SOS**: Large tactile SOS button with instant siren, spoken confirmation, device haptics, GPS coordinate broadcast, and caregiver dispatch.
  - **Voice Guidance Customization**: Control speech rate (0.75× – 1.5×), volume, and haptic feedback.
  - **Buzzer Beacon ("Find My Cane")**: Triggers the cane's acoustic buzzer for effortless location.

- **Company / Developer Mode (Unlocked via Dev Passcode `1234`)**:
  - **Radxa ZERO 3W & RKNN NPU Telemetry**: Monitor inference throughput (FPS), latency (ms), and passive thermal management status (verifies 0-fan silent cooling).
  - **2S Battery Pack & MP1584 Buck Rail**: Real-time cell balancing voltages (Cell 1 & Cell 2), current draw (mA), and regulated 5V output.
  - **CANIE Engine Diagnostics**: Real-time rule inspector, priority matrix (Critical, High, Medium, Low), and active memory suppression buffer.
  - **Perception Testbench**: Simulate synthetic obstacle detections to verify repeat-suppression and audio prioritization.
  - **Offline SQLite Buffer & Cloud Sync**: Inspect queued telemetry entries and trigger manual synchronization with Firebase Cloud.
  - **Sensor Zero-Point Calibration**: Tare MPU6050 gyroscope and align dual ultrasonic sensors.
  - **SOS Dispatch Center**: Monitor incoming emergency incidents with GPS coordinates and resolution workflows.

---

## 🛠️ Updated Hardware Architecture Specifications

| Subsystem | Component | Specifications |
|---|---|---|
| **Edge Compute** | Radxa ZERO 3W | Rockchip RK3566, 4 GB LPDDR4, 0.8 TOPS NPU |
| **Model Runtime** | YOLO11-S (INT8) | Fine-tuned $\rightarrow$ Quantized to RKNN format on NPU |
| **Vision Input** | Radxa Camera 8M | Sony IMX219 (8 MP) |
| **Proximity Sensors** | 2 × JSN-SR04T | Waterproof dual ultrasonic array (Left & Right clearance) |
| **Motion Context** | MPU6050 | 6-Axis Accelerometer & Gyroscope (Fall detection) |
| **Power Supply** | 2 × Molicel P30B | 18650 3000 mAh cells in 2S series connection (7.4V – 8.4V) |
| **Protection** | 2S 20A BMS | Cell balancing, overcharge, and overcurrent protection |
| **Voltage Regulator**| MP1584 Buck Regulator | Fixed 5V regulated output to Radxa ZERO 3W input |
| **Thermal System** | Passive Cooling | Aluminum heat spreader + thermal interface pad (No fan) |
| **Emergency Control**| Momentary Push Switch | Top-mounted on handle |
| **Audio Guidance** | Bluetooth 5.3 | Low-latency audio stream to Bluetooth earpiece |

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
cd mobile
npm install
```

### Run Development Server
```bash
npm run dev
```
By default, the server runs on `http://0.0.0.0:5173`.

### 📱 Testing on Your Physical Mobile Phone for Free
1. Ensure your phone and PC are connected to the same Wi-Fi network.
2. Note your PC's local IP address (e.g., `192.168.1.5`).
3. Open Chrome (Android) or Safari (iOS) on your phone and navigate to `http://<YOUR_PC_IP>:5173`.
4. Allow camera permissions when prompted to test real-time phone camera detection!
5. **Install to Home Screen (PWA)**:
   - On Android: Tap `⋮` (menu) $\rightarrow$ **"Add to Home Screen"** or **"Install app"**.
   - On iOS: Tap Share $\rightarrow$ **"Add to Home Screen"**.
   - The app will now launch full-screen like a native mobile app without paying any third-party fees!
