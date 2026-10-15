import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Configurable base URL: Defaults to production server, no localhost dependency
  static const String defaultBaseUrl = "https://navify-api.onrender.com/api";
  String _baseUrl = defaultBaseUrl;

  String? _token;
  String? get token => _token;

  ApiService() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('navify_auth_token');
      _baseUrl = prefs.getString('navify_api_url') ?? defaultBaseUrl;
    } catch (_) {}
  }

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('navify_api_url', url);
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('navify_auth_token', token);
    } else {
      await prefs.remove('navify_auth_token');
    }
  }

  Map<String, String> _headers() {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Future<Map<String, dynamic>?> checkHealth() async {
    try {
      final res = await http.get(Uri.parse('$_baseUrl/status'), headers: _headers()).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (_) {}
    return null;
  }

  Future<bool> sendSOSAlert({
    required String location,
    required double lat,
    required double lng,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/sos'),
        headers: _headers(),
        body: jsonEncode({
          'type': 'Mobile Native App SOS',
          'location': location,
          'lat': lat,
          'lng': lng,
          'maps_url': 'https://maps.google.com/?q=$lat,$lng',
        }),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false; // Graceful offline fallback
    }
  }

  Future<bool> syncDetection(String label, int confidence) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/detections'),
        headers: _headers(),
        body: jsonEncode({
          'label': label,
          'confidence': confidence,
          'source': 'mobile_flutter',
        }),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

