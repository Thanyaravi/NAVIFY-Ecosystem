class DetectedObject {
  final String id;
  final String label;
  final int confidence;
  final String position; // "straight ahead", "on your left", "on your right"
  final String proximity; // "immediate", "close", "nearby", "far"
  final String priority; // "CRITICAL", "HIGH", "MEDIUM", "LOW"
  final String timestamp;
  final String source; // "Phone Cam" or "Radxa IMX219"

  DetectedObject({
    required this.id,
    required this.label,
    required this.confidence,
    required this.position,
    required this.proximity,
    required this.priority,
    required this.timestamp,
    this.source = "Phone Cam",
  });

  factory DetectedObject.fromJson(Map<String, dynamic> json) {
    return DetectedObject(
      id: json['id'] ?? '',
      label: json['label'] ?? 'Obstacle',
      confidence: json['confidence'] ?? 0,
      position: json['position'] ?? 'straight ahead',
      proximity: json['proximity'] ?? 'nearby',
      priority: json['priority'] ?? 'MEDIUM',
      timestamp: json['timestamp'] ?? '',
      source: json['source'] ?? 'Phone Cam',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'confidence': confidence,
      'position': position,
      'proximity': proximity,
      'priority': priority,
      'timestamp': timestamp,
      'source': source,
    };
  }
}

