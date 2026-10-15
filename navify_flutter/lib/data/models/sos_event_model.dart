class SOSEvent {
  final String id;
  final String timestamp;
  final String deviceId;
  final String location;
  final double? lat;
  final double? lng;
  final String status; // "ACTIVE" or "RESOLVED"
  final String resolutionNote;

  SOSEvent({
    required this.id,
    required this.timestamp,
    required this.deviceId,
    required this.location,
    this.lat,
    this.lng,
    required this.status,
    required this.resolutionNote,
  });

  SOSEvent copyWith({String? status, String? resolutionNote}) {
    return SOSEvent(
      id: id,
      timestamp: timestamp,
      deviceId: deviceId,
      location: location,
      lat: lat,
      lng: lng,
      status: status ?? this.status,
      resolutionNote: resolutionNote ?? this.resolutionNote,
    );
  }
}

class EmergencyContact {
  final String id;
  final String name;
  final String relation;
  final String phone;
  final bool isPrimary;

  EmergencyContact({
    required this.id,
    required this.name,
    required this.relation,
    required this.phone,
    this.isPrimary = false,
  });
}

