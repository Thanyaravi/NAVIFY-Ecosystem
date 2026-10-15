import '../data/models/detection_model.dart';

class CanieGuidance {
  final String message;
  final String priority; // CRITICAL, HIGH, MEDIUM, LOW
  final DateTime timestamp;

  CanieGuidance({
    required this.message,
    required this.priority,
    required this.timestamp,
  });
}

class CanieEngine {
  // Memory buffer to debounce speech alerts and prevent audio spamming
  final Map<String, int> _lastAlertTimestamps = {};
  static const int _alertDebounceMs = 3500;

  CanieGuidance evaluate({
    required List<DetectedObject> detections,
    required int leftUltrasonicCm,
    required int rightUltrasonicCm,
  }) {
    final now = DateTime.now().millisecondsSinceEpoch;

    // 1. Check Ultrasonic Ground & Proximity First (Hardware Safety Floor)
    if (leftUltrasonicCm > 0 && leftUltrasonicCm < 50) {
      return CanieGuidance(
        message: "Immediate obstacle on your left, ${leftUltrasonicCm} centimeters. Stop or veer right.",
        priority: "CRITICAL",
        timestamp: DateTime.now(),
      );
    }
    if (rightUltrasonicCm > 0 && rightUltrasonicCm < 50) {
      return CanieGuidance(
        message: "Immediate obstacle on your right, ${rightUltrasonicCm} centimeters. Stop or veer left.",
        priority: "CRITICAL",
        timestamp: DateTime.now(),
      );
    }

    if (detections.isEmpty) {
      return CanieGuidance(
        message: "Path is clear. Proceed straight.",
        priority: "LOW",
        timestamp: DateTime.now(),
      );
    }

    // 2. Sort by urgency priority (CRITICAL -> HIGH -> MEDIUM -> LOW)
    final sorted = List<DetectedObject>.from(detections);
    sorted.sort((a, b) => _priorityWeight(b.priority).compareTo(_priorityWeight(a.priority)));

    for (final det in sorted) {
      final key = "${det.label}_${det.position}";
      final lastTime = _lastAlertTimestamps[key] ?? 0;

      // Only speak if not recently announced or if critical
      if (det.priority == "CRITICAL" || (now - lastTime) > _alertDebounceMs) {
        _lastAlertTimestamps[key] = now;

        String actionRecommendation;
        if (det.position.contains("left")) {
          actionRecommendation = "Veer right.";
        } else if (det.position.contains("right")) {
          actionRecommendation = "Veer left.";
        } else {
          actionRecommendation = "Slow down and proceed with caution.";
        }

        return CanieGuidance(
          message: "${det.priority == 'CRITICAL' ? 'Warning: ' : ''}${det.label} ${det.position}, ${det.proximity}. $actionRecommendation",
          priority: det.priority,
          timestamp: DateTime.now(),
        );
      }
    }

    return CanieGuidance(
      message: "Path ahead is monitored. Proceed steadily.",
      priority: "LOW",
      timestamp: DateTime.now(),
    );
  }

  int _priorityWeight(String priority) {
    switch (priority) {
      case "CRITICAL":
        return 4;
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      default:
        return 1;
    }
  }

  void reset() {
    _lastAlertTimestamps.clear();
  }
}

