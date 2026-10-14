"""NAVIFY Ecosystem Backend API tests."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://navify-ecosystem.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "thanyaravi02@gmail.com"
ADMIN_PASSWORD = "Navify@2026"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- auth ----------------
class TestAuth:
    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_ok(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_me(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["user"]["email"] == ADMIN_EMAIL

    def test_me_no_auth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_register_and_login(self):
        email = f"test_{uuid.uuid4().hex[:8]}@navify.io"
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "TEST User"}, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["email"] == email
        assert "token" in d
        # Verify seeded data appeared for new user
        h = {"Authorization": f"Bearer {d['token']}"}
        c = requests.get(f"{API}/contacts", headers=h, timeout=15).json()
        assert isinstance(c, list) and len(c) >= 3

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={"email": ADMIN_EMAIL, "password": "Passw0rd!", "name": "X"}, timeout=15)
        assert r.status_code == 400

    def test_logout(self, auth_headers):
        r = requests.post(f"{API}/auth/logout", headers=auth_headers, timeout=15)
        assert r.status_code == 200


# ---------------- protected endpoints require auth ----------------
@pytest.mark.parametrize("path,method", [
    ("/detections", "GET"), ("/detections", "POST"), ("/detections/stats", "GET"),
    ("/journeys", "GET"), ("/journeys", "POST"),
    ("/sos", "GET"), ("/sos", "POST"),
    ("/contacts", "GET"), ("/contacts", "POST"),
    ("/settings", "GET"), ("/settings", "PUT"),
    ("/dashboard/summary", "GET"),
])
def test_endpoints_require_auth(path, method):
    r = requests.request(method, f"{API}{path}", json={}, timeout=15)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


# ---------------- detections ----------------
class TestDetections:
    def test_list(self, auth_headers):
        r = requests.get(f"{API}/detections", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_and_verify(self, auth_headers):
        payload = {"label": "TEST_Person", "confidence": 92, "source": "mobile"}
        r = requests.post(f"{API}/detections", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["label"] == "TEST_Person"
        assert d["confidence"] == 92
        assert d["source"] == "mobile"
        # Verify persistence
        lst = requests.get(f"{API}/detections", headers=auth_headers, timeout=15).json()
        assert any(item.get("id") == d["id"] for item in lst)

    def test_stats(self, auth_headers):
        r = requests.get(f"{API}/detections/stats", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        if rows:
            row = rows[0]
            assert "label" in row and "count" in row and "pct" in row


# ---------------- journeys ----------------
class TestJourneys:
    def test_list(self, auth_headers):
        r = requests.get(f"{API}/journeys", headers=auth_headers, timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_create(self, auth_headers):
        payload = {"route": "TEST_A → TEST_B", "distance": "1.0 km", "duration": "10 min", "detections": 3}
        r = requests.post(f"{API}/journeys", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["route"] == payload["route"]
        lst = requests.get(f"{API}/journeys", headers=auth_headers, timeout=15).json()
        assert any(x.get("id") == d["id"] for x in lst)


# ---------------- sos ----------------
class TestSOS:
    def test_create_and_list(self, auth_headers):
        r = requests.post(f"{API}/sos", headers=auth_headers, json={"type": "TEST Trigger", "location": "TEST_LOC"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["type"] == "TEST Trigger" and d["status"] == "Active"
        assert "notified" in d
        n = d["notified"]
        assert n["email_configured"] is True
        assert n["sms_configured"] is False
        assert isinstance(n["email"], int) and isinstance(n["sms"], int)
        assert n["sms"] == 0
        lst = requests.get(f"{API}/sos", headers=auth_headers, timeout=15).json()
        assert any(x.get("id") == d["id"] for x in lst)

    def test_create_with_geo_builds_maps_url(self, auth_headers):
        payload = {"type": "TEST Geo", "location": "12.9716,77.5946", "lat": 12.9716, "lng": 77.5946}
        r = requests.post(f"{API}/sos", headers=auth_headers, json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["lat"] == 12.9716 and d["lng"] == 77.5946
        assert d["maps_url"].startswith("https://maps.google.com/?q=12.9716,77.5946")

    def test_fall_detected_notified_persisted(self, auth_headers):
        payload = {"type": "Fall Detected", "location": "TEST_FALL_LOC", "lat": 40.7128, "lng": -74.0060}
        r = requests.post(f"{API}/sos", headers=auth_headers, json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["type"] == "Fall Detected"
        assert d["status"] == "Active"
        assert d["maps_url"].startswith("https://maps.google.com/?q=40.7128,-74.006")
        n = d["notified"]
        assert n["email_configured"] is True
        assert n["sms_configured"] is False
        assert n["sms"] == 0
        assert n["email"] >= 1  # owner CC at minimum
        # Verify persistence — event appears in GET with type & notified
        lst = requests.get(f"{API}/sos", headers=auth_headers, timeout=15).json()
        found = next((x for x in lst if x.get("id") == d["id"]), None)
        assert found is not None
        assert found["type"] == "Fall Detected"
        assert "notified" in found
        assert found["notified"]["email"] == n["email"]
        assert found["notified"]["email_configured"] is True
        assert found["notified"]["sms_configured"] is False

    def test_location_fallback_when_unknown(self, auth_headers):
        # location='Unknown' + lat/lng should be stored as formatted 'lat, lng' string
        payload = {"type": "TEST Fallback", "location": "Unknown", "lat": 51.5074, "lng": -0.1278}
        r = requests.post(f"{API}/sos", headers=auth_headers, json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["location"] != "Unknown"
        assert "51.5074" in d["location"] and "-0.1278" in d["location"]


class TestNotificationsStatus:
    def test_status(self, auth_headers):
        r = requests.get(f"{API}/notifications/status", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email_configured"] is True
        assert d["sms_configured"] is False

    def test_status_requires_auth(self):
        r = requests.get(f"{API}/notifications/status", timeout=15)
        assert r.status_code == 401


# ---------------- contacts ----------------
class TestContacts:
    def test_crud(self, auth_headers):
        payload = {"name": "TEST_Contact", "relation": "Friend", "phone": "+1 555 555 5555", "primary": False}
        r = requests.post(f"{API}/contacts", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        cid = r.json()["id"]
        lst = requests.get(f"{API}/contacts", headers=auth_headers, timeout=15).json()
        assert any(x.get("id") == cid for x in lst)
        d = requests.delete(f"{API}/contacts/{cid}", headers=auth_headers, timeout=15)
        assert d.status_code == 200
        lst2 = requests.get(f"{API}/contacts", headers=auth_headers, timeout=15).json()
        assert not any(x.get("id") == cid for x in lst2)

    def test_create_with_email(self, auth_headers):
        payload = {"name": "TEST_Emailed", "relation": "Sibling", "phone": "+1 555 000 1111",
                   "email": "TEST_contact@example.com", "primary": False}
        r = requests.post(f"{API}/contacts", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == "TEST_contact@example.com"
        cid = d["id"]
        lst = requests.get(f"{API}/contacts", headers=auth_headers, timeout=15).json()
        fetched = next((x for x in lst if x.get("id") == cid), None)
        assert fetched is not None
        assert fetched["email"] == "TEST_contact@example.com"
        # cleanup
        requests.delete(f"{API}/contacts/{cid}", headers=auth_headers, timeout=15)


# ---------------- settings ----------------
class TestSettings:
    def test_get(self, auth_headers):
        r = requests.get(f"{API}/settings", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "theme" in d

    def test_update_persist(self, auth_headers):
        r = requests.put(f"{API}/settings", headers=auth_headers, json={"theme": "dark"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["theme"] == "dark"
        g = requests.get(f"{API}/settings", headers=auth_headers, timeout=15).json()
        assert g["theme"] == "dark"
        # revert
        requests.put(f"{API}/settings", headers=auth_headers, json={"theme": "light"}, timeout=15)

    def test_device_fields_persist_together(self, auth_headers):
        # PUT full device object
        device = {"haptic": True, "voice": True, "streamUrl": "http://pi.local:8080/stream.mjpg"}
        r = requests.put(f"{API}/settings", headers=auth_headers, json={"device": device}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["device"]["haptic"] is True
        assert d["device"]["voice"] is True
        assert d["device"]["streamUrl"] == "http://pi.local:8080/stream.mjpg"
        # Now do an UNRELATED PUT (theme) — device object must survive
        requests.put(f"{API}/settings", headers=auth_headers, json={"theme": "light"}, timeout=15)
        g = requests.get(f"{API}/settings", headers=auth_headers, timeout=15).json()
        assert g["device"]["streamUrl"] == "http://pi.local:8080/stream.mjpg"
        assert g["device"]["voice"] is True
        assert g["device"]["haptic"] is True


# ---------------- dashboard ----------------
class TestDashboard:
    def test_summary(self, auth_headers):
        r = requests.get(f"{API}/dashboard/summary", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["stats", "statusPills", "hardwareStatus", "deviceHealth"]:
            assert k in d and isinstance(d[k], list) and len(d[k]) > 0
        stat_ids = {s["id"] for s in d["stats"]}
        assert {"journey", "battery", "detections", "sos"} <= stat_ids
        det = next(s for s in d["stats"] if s["id"] == "detections")
        assert int(det["value"]) >= 1
