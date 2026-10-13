/**
 * NAVIFY Hardware Specification & Telemetry Constants
 * Aligned with the approved final product architecture (Radxa ZERO 3W + RK3566)
 */

export const NAVIFY_HARDWARE_SPEC = {
  deviceName: "NAVIFY Cane Pro",
  model: "NC-3000-RK",
  serialNumber: "NVF-RK3566-9041",
  firmwareVersion: "v3.2.1-prod",
  processor: {
    name: "Radxa ZERO 3W",
    soc: "Rockchip RK3566",
    ram: "4 GB LPDDR4",
    npu: "0.8 TOPS RKNN NPU",
    cooling: "Passive Thermal Management (Aluminum Heat Spreader - Fanless)",
  },
  camera: {
    model: "Radxa Camera 8M 219",
    sensor: "Sony IMX219",
    resolution: "3280 × 2464 (8 MP)",
    fov: "77° Horizontal",
  },
  proximity: {
    type: "Dual Ultrasonic Sensors",
    model: "2 × JSN-SR04T Waterproof Proximity",
    configuration: "Left (30° offset) + Right (30° offset)",
    rangeMinMeters: 0.20,
    rangeMaxMeters: 4.50,
  },
  imu: {
    model: "MPU6050 6-Axis Motion & Orientation",
    capabilities: ["3-Axis Gyroscope", "3-Axis Accelerometer", "Fall Detection"],
  },
  powerSystem: {
    batteryType: "2 × Molicel INR18650-P30B in Series (2S)",
    nominalVoltage: "7.4 V",
    fullChargeVoltage: "8.4 V",
    cutOffVoltage: "6.0 V",
    capacityTotal: "3000 mAh (22.2 Wh)",
    bms: "2S 20A Protection & Balancing BMS",
    regulator: "MP1584 Fixed 5V Buck Regulator (Regulated Output to Radxa)",
    chargerInput: "Dedicated 8.4V 2A Li-ion Charger",
    estimatedRuntimeHours: "4.5 - 6.0 hours",
  },
  audioOutput: {
    type: "Bluetooth 5.3 Low-Latency Audio",
    target: "Bluetooth Earpiece",
  },
  emergencyControl: {
    type: "Top-Mounted Momentary SOS Button",
    location: "Handle top (thumb accessible)",
  },
  storage: {
    type: "MicroSD Card 64GB",
    localDb: "SQLite Offline-First Telemetry & Decision Log",
    cloudSync: "Firebase Cloud Sync (Automated when Wi-Fi/Cellular available)",
  },
};

export const INITIAL_TELEMETRY = {
  connected: true,
  connectionType: "Bluetooth 5.3",
  batteryPercentage: 88,
  batteryVoltage: 7.84, // 2S voltage (approx 3.92V per cell)
  cell1Voltage: 3.92,
  cell2Voltage: 3.92,
  currentDrawMa: 580,
  regulator5vRail: 5.04, // MP1584 regulated 5V output
  temperatureCelsius: 41.5, // Passive cooling stable under load
  radxaZeroStatus: "online",
  npuStatus: "active",
  npuFps: 18.4,
  npuLatencyMs: 24,
  cameraFps: 30,
  cameraStatus: "online",
  leftUltrasonicCm: 182,
  rightUltrasonicCm: 215,
  imu: {
    pitch: 2.1,
    roll: -0.8,
    yaw: 14.5,
    motionState: "Walking Steadily",
    fallDetected: false,
  },
  lastSyncTime: "Just now",
  offlineLogsPending: 3,
  firebaseConnected: true,
};

