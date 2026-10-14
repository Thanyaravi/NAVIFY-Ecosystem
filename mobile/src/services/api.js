/**
 * NAVIFY Production API Service
 * Supports secure HTTPS communication with backend server,
 * automatic token management, and resilient offline fallback.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("navify_token") || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("navify_token", token);
    } else {
      localStorage.removeItem("navify_token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      // Log for debugging in developer console
      console.warn(`[NAVIFY API Offline / Warning]: ${endpoint}`, err.message);
      throw err;
    }
  }

  // Auth Endpoints
  async register(email, password, name) {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(email, password) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.setToken(null);
    }
  }

  // Dashboard & Health
  async getDashboardSummary() {
    return this.request("/dashboard/summary");
  }

  async getHealthStatus() {
    return this.request("/status");
  }

  // Detections
  async getDetections(limit = 50) {
    return this.request(`/detections?limit=${limit}`);
  }

  async logDetection(label, confidence, source = "mobile") {
    return this.request("/detections", {
      method: "POST",
      body: JSON.stringify({ label, confidence, source }),
    });
  }

  async getDetectionStats() {
    return this.request("/detections/stats");
  }

  // SOS Emergency
  async getSOSEvents() {
    return this.request("/sos");
  }

  async triggerSOS(data) {
    return this.request("/sos", {
      method: "POST",
      body: JSON.stringify({
        type: data.type || "Manual Trigger",
        location: data.location || "Unknown",
        lat: data.lat || null,
        lng: data.lng || null,
        accuracy: data.accuracy || null,
        maps_url: data.maps_url || null,
      }),
    });
  }

  // Journeys
  async getJourneys() {
    return this.request("/journeys");
  }

  async logJourney(data) {
    return this.request("/journeys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Emergency Contacts
  async getContacts() {
    return this.request("/contacts");
  }

  async createContact(contact) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(contactId) {
    return this.request(`/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  // Settings
  async getSettings() {
    return this.request("/settings");
  }

  async updateSettings(settings) {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiService();

