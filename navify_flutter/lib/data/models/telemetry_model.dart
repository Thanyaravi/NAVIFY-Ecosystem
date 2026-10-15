class CaneTelemetry {
  final bool connected;
  final String connectionType;
  final int batteryPercentage;
  final double batteryVoltage;
  final double cell1Voltage;
  final double cell2Voltage;
  final int currentDrawMa;
  final double regulator5vRail;
  final double temperatureCelsius;
  final String radxaZeroStatus;
  final String npuStatus;
  final double npuFps;
  final int npuLatencyMs;
  final int leftUltrasonicCm;
  final int rightUltrasonicCm;
  final String motionState;
  final bool fallDetected;
  final String lastSyncTime;
  final int offlineLogsPending;

  CaneTelemetry({
    this.connected = true,
    this.connectionType = "Bluetooth 5.3",
    this.batteryPercentage = 88,
    this.batteryVoltage = 7.84,
    this.cell1Voltage = 3.92,
    this.cell2Voltage = 3.92,
    this.currentDrawMa = 580,
    this.regulator5vRail = 5.04,
    this.temperatureCelsius = 41.5,
    this.radxaZeroStatus = "online",
    this.npuStatus = "active",
    this.npuFps = 18.4,
    this.npuLatencyMs = 24,
    this.leftUltrasonicCm = 182,
    this.rightUltrasonicCm = 215,
    this.motionState = "Walking Steadily",
    this.fallDetected = false,
    this.lastSyncTime = "Just now",
    this.offlineLogsPending = 3,
  });

  CaneTelemetry copyWith({
    bool? connected,
    int? batteryPercentage,
    double? batteryVoltage,
    double? cell1Voltage,
    double? cell2Voltage,
    int? currentDrawMa,
    double? temperatureCelsius,
    int? leftUltrasonicCm,
    int? rightUltrasonicCm,
    String? motionState,
    bool? fallDetected,
    String? lastSyncTime,
    int? offlineLogsPending,
  }) {
    return CaneTelemetry(
      connected: connected ?? this.connected,
      connectionType: this.connectionType,
      batteryPercentage: batteryPercentage ?? this.batteryPercentage,
      batteryVoltage: batteryVoltage ?? this.batteryVoltage,
      cell1Voltage: cell1Voltage ?? this.cell1Voltage,
      cell2Voltage: cell2Voltage ?? this.cell2Voltage,
      currentDrawMa: currentDrawMa ?? this.currentDrawMa,
      regulator5vRail: this.regulator5vRail,
      temperatureCelsius: temperatureCelsius ?? this.temperatureCelsius,
      radxaZeroStatus: this.radxaZeroStatus,
      npuStatus: this.npuStatus,
      npuFps: this.npuFps,
      npuLatencyMs: this.npuLatencyMs,
      leftUltrasonicCm: leftUltrasonicCm ?? this.leftUltrasonicCm,
      rightUltrasonicCm: rightUltrasonicCm ?? this.rightUltrasonicCm,
      motionState: motionState ?? this.motionState,
      fallDetected: fallDetected ?? this.fallDetected,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
      offlineLogsPending: offlineLogsPending ?? this.offlineLogsPending,
    );
  }
}

