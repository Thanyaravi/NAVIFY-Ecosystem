import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../data/models/hardware_spec.dart';
import '../../data/models/telemetry_model.dart';
import '../../data/models/detection_model.dart';
import '../../data/models/sos_event_model.dart';
import '../../data/services/api_service.dart';
import '../../data/services/tts_service.dart';
import '../../domain/canie_engine.dart';

class AppViewModel extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final TtsService _ttsService = TtsService();
  final CanieEngine _canieEngine = CanieEngine();

  // Role: "user" | "company"
  String _role = "user";
  String get role => _role;

  // Active Tab
  int _activeTabIndex = 0;
  int get activeTabIndex => _activeTabIndex;

  // Theme Mode: Dark (default) | Light
  ThemeMode _themeMode = ThemeMode.dark;
  ThemeMode get themeMode => _themeMode;

  // Hardware Telemetry
  CaneTelemetry _telemetry = CaneTelemetry();
  CaneTelemetry get telemetry => _telemetry;

  // Live Detections
  List<DetectedObject> _liveDetections = [];
  List<DetectedObject> get liveDetections => _liveDetections;

  final List<DetectedObject> _detectionHistory = [
    DetectedObject(
      id: "det-101",
      label: "Person",
      confidence: 94,
      position: "straight ahead",
      proximity: "1.4m (nearby)",
      priority: "HIGH",
      timestamp: "10:14:22",
      source: "Camera",
    ),
    DetectedObject(
      id: "det-100",
      label: "Chair",
      confidence: 88,
      position: "on your right",
      proximity: "0.9m (close)",
      priority: "MEDIUM",
      timestamp: "10:12:05",
      source: "Camera",
    ),
  ];
  List<DetectedObject> get detectionHistory => _detectionHistory;

  // CANIE Guidance
  CanieGuidance _currentGuidance = CanieGuidance(
    message: "Path is clear. Proceed straight.",
    priority: "LOW",
    timestamp: DateTime.now(),
  );
  CanieGuidance get currentGuidance => _currentGuidance;

  // SOS Emergency State
  bool _sosActive = false;
  bool get sosActive => _sosActive;

  final List<SOSEvent> _sosEvents = [
    SOSEvent(
      id: "sos-init-1",
      timestamp: "Yesterday, 18:22",
      deviceId: NavifyHardwareSpec.serialNumber,
      location: "12.9716° N, 77.5946° E (Bengaluru)",
      lat: 12.9716,
      lng: 77.5946,
      status: "RESOLVED",
      resolutionNote: "Routine drill test by caregiver",
    ),
  ];
  List<SOSEvent> get sosEvents => _sosEvents;

  final List<EmergencyContact> _contacts = [
    EmergencyContact(
      id: "c1",
      name: "Vikram Sir",
      relation: "Lead Mentor / Caregiver",
      phone: "+91 98450 12345",
      isPrimary: true,
    ),
    EmergencyContact(
      id: "c2",
      name: "Tejas P",
      relation: "Emergency Responder",
      phone: "+91 99001 98765",
      isPrimary: false,
    ),
  ];
  List<EmergencyContact> get contacts => _contacts;

  Timer? _telemetryTimer;

  AppViewModel() {
    _startTelemetryLoop();
  }

  void setRole(String newRole) {
    _role = newRole;
    _activeTabIndex = 0;
    notifyListeners();
  }

  void setActiveTab(int index) {
    _activeTabIndex = index;
    notifyListeners();
  }

  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  // Set detections and evaluate with CANIE
  void setDetections(List<DetectedObject> detections) {
    _liveDetections = detections;
    _currentGuidance = _canieEngine.evaluate(
      detections: detections,
      leftUltrasonicCm: _telemetry.leftUltrasonicCm,
      rightUltrasonicCm: _telemetry.rightUltrasonicCm,
    );

    if (detections.isNotEmpty) {
      _detectionHistory.insert(0, detections.first);
      if (_detectionHistory.length > 50) _detectionHistory.removeLast();
      
      // Voice alert
      _ttsService.speak(_currentGuidance.message);

      // Opportunistic sync to cloud
      _apiService.syncDetection(detections.first.label, detections.first.confidence);
    }

    notifyListeners();
  }

  // Trigger SOS Emergency
  Future<void> triggerSOS() async {
    _sosActive = true;
    notifyListeners();

    double lat = 12.9716;
    double lng = 77.5946;
    String locationText = "12.9716° N, 77.5946° E";

    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 4),
      );
      lat = pos.latitude;
      lng = pos.longitude;
      locationText = "${lat.toStringAsFixed(4)}° N, ${lng.toStringAsFixed(4)}° E";
    } catch (_) {}

    final newEvent = SOSEvent(
      id: "sos-${DateTime.now().millisecondsSinceEpoch}",
      timestamp: "Just now",
      deviceId: NavifyHardwareSpec.serialNumber,
      location: locationText,
      lat: lat,
      lng: lng,
      status: "ACTIVE",
      resolutionNote: "Alert broadcast to emergency contacts & NAVIFY Console.",
    );

    _sosEvents.insert(0, newEvent);
    notifyListeners();

    // Announce via voice
    _ttsService.speak("Emergency SOS activated. Contacting ${_contacts.isNotEmpty ? _contacts.first.name : 'caregiver'} with your location.");

    // Cloud alert
    _apiService.sendSOSAlert(location: locationText, lat: lat, lng: lng);

    // Auto-dial primary contact directly via Android Phone intent
    if (_autoCallOnSos && _contacts.isNotEmpty) {
      final primary = _contacts.firstWhere((c) => c.isPrimary, orElse: () => _contacts.first);
      Future.delayed(const Duration(milliseconds: 1200), () {
        callContact(primary.phone);
      });
    }
  }

  bool _autoCallOnSos = true;
  bool get autoCallOnSos => _autoCallOnSos;

  void toggleAutoCallOnSos() {
    _autoCallOnSos = !_autoCallOnSos;
    notifyListeners();
  }

  void updateContact(String id, String newName, String newRelation, String newPhone, bool isPrimary) {
    final idx = _contacts.indexWhere((c) => c.id == id);
    if (idx != -1) {
      if (isPrimary) {
        for (int i = 0; i < _contacts.length; i++) {
          _contacts[i] = EmergencyContact(
            id: _contacts[i].id,
            name: _contacts[i].name,
            relation: _contacts[i].relation,
            phone: _contacts[i].phone,
            isPrimary: false,
          );
        }
      }
      _contacts[idx] = EmergencyContact(
        id: id,
        name: newName,
        relation: newRelation,
        phone: newPhone,
        isPrimary: isPrimary,
      );
      notifyListeners();
    }
  }

  void addContact(String name, String relation, String phone, bool isPrimary) {
    if (isPrimary) {
      for (int i = 0; i < _contacts.length; i++) {
        _contacts[i] = EmergencyContact(
          id: _contacts[i].id,
          name: _contacts[i].name,
          relation: _contacts[i].relation,
          phone: _contacts[i].phone,
          isPrimary: false,
        );
      }
    }
    _contacts.add(EmergencyContact(
      id: "c_${DateTime.now().millisecondsSinceEpoch}",
      name: name,
      relation: relation,
      phone: phone,
      isPrimary: isPrimary,
    ));
    notifyListeners();
  }

  void resolveSOS(String eventId) {
    final index = _sosEvents.indexWhere((e) => e.id == eventId);
    if (index != -1) {
      _sosEvents[index] = _sosEvents[index].copyWith(
        status: "RESOLVED",
        resolutionNote: "Marked resolved by caregiver",
      );
    }
    _sosActive = false;
    notifyListeners();
  }

  Future<void> callContact(String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'\s+'), '');
    final uri = Uri.parse("tel:$cleaned");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  // Ambient sensor jitter for realistic testing
  void _startTelemetryLoop() {
    _telemetryTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      final rand = Random();
      final tempDelta = (rand.nextDouble() - 0.5) * 0.4;
      final leftDelta = (rand.nextInt(11) - 5);
      final rightDelta = (rand.nextInt(11) - 5);
      final currentDelta = (rand.nextInt(31) - 15);

      _telemetry = _telemetry.copyWith(
        temperatureCelsius: double.parse((_telemetry.temperatureCelsius + tempDelta).toStringAsFixed(1)),
        leftUltrasonicCm: (_telemetry.leftUltrasonicCm + leftDelta).clamp(30, 350),
        rightUltrasonicCm: (_telemetry.rightUltrasonicCm + rightDelta).clamp(30, 350),
        currentDrawMa: (_telemetry.currentDrawMa + currentDelta).clamp(480, 680),
      );
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _telemetryTimer?.cancel();
    super.dispose();
  }
}

