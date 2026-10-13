/**
 * CANIE - Context-Aware Navigation Intelligence Engine
 * The decision-making core for NAVIFY Ecosystem.
 *
 * Evaluates semantic object detections, left/right ultrasonic proximities,
 * and IMU motion context to produce concise, prioritized, non-repetitive voice guidance.
 */

export const OBSTACLE_PRIORITIES = {
  // Critical Hazards (immediate safety concern)
  stairs: { priority: "CRITICAL", alertTemplate: "Stop. Staircase directly ahead." },
  car: { priority: "CRITICAL", alertTemplate: "Warning. Vehicle ahead." },
  bus: { priority: "CRITICAL", alertTemplate: "Warning. Vehicle ahead." },
  truck: { priority: "CRITICAL", alertTemplate: "Warning. Heavy vehicle ahead." },
  motorcycle: { priority: "CRITICAL", alertTemplate: "Warning. Moving motorcycle ahead." },

  // High Obstacles (path blockage / navigation impediment)
  person: { priority: "HIGH", alertTemplate: "Person approaching ahead. Slow down." },
  door: { priority: "HIGH", alertTemplate: "Door ahead." },
  wall: { priority: "HIGH", alertTemplate: "Wall ahead. Path obstructed." },
  bicycle: { priority: "HIGH", alertTemplate: "Bicycle on path." },

  // Medium Obstacles (furniture & indoor obstacles)
  chair: { priority: "MEDIUM", alertTemplate: "Chair on path." },
  couch: { priority: "MEDIUM", alertTemplate: "Furniture ahead." },
  bed: { priority: "MEDIUM", alertTemplate: "Obstacle ahead." },
  "dining table": { priority: "MEDIUM", alertTemplate: "Table ahead." },
  traffic_light: { priority: "MEDIUM", alertTemplate: "Traffic signal ahead." },
  bench: { priority: "MEDIUM", alertTemplate: "Bench ahead." },

  // Low Obstacles (small / non-blocking)
  backpack: { priority: "LOW", alertTemplate: "Object on floor." },
  handbag: { priority: "LOW", alertTemplate: "Object nearby." },
  suitcase: { priority: "LOW", alertTemplate: "Luggage nearby." },
  bottle: { priority: "LOW", alertTemplate: "Small object." },
};

export class CanieEngine {
  constructor(options = {}) {
    this.cooldownMs = options.cooldownMs || 4500; // 4.5s debounce for repeat alerts
    this.memory = new Map(); // label -> { timestamp, proximity, position }
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
    this.priorityWeights = {
      CRITICAL: 100,
      HIGH: 70,
      MEDIUM: 40,
      LOW: 10,
    };
  }

  /**
   * Reset CANIE memory buffer
   */
  clearMemory() {
    this.memory.clear();
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
  }

  /**
   * Evaluates raw detections and sensor fusion context
   * @param {Array} detections - [{ label, confidence, position, proximity, bbox }]
   * @param {Object} sensorContext - { leftUltrasonicCm, rightUltrasonicCm, imuMotionState }
   * @returns {Object|null} - Prioritized decision guidance or null
   */
  evaluate(detections, sensorContext = {}) {
    const now = Date.now();
    const { leftUltrasonicCm = 200, rightUltrasonicCm = 200, imuMotionState = "Walking" } = sensorContext;

    // Check ultrasonic proximity overrides (if cane physical sensors detect closer than camera)
    const ultrasonicMinCm = Math.min(leftUltrasonicCm, rightUltrasonicCm);
    let ultrasonicAlert = null;
    if (ultrasonicMinCm < 60) {
      const side = leftUltrasonicCm < rightUltrasonicCm ? "on your left" : "on your right";
      const evade = leftUltrasonicCm < rightUltrasonicCm ? "Move slightly right." : "Move slightly left.";
      ultrasonicAlert = {
        label: "Ultrasonic Proximity",
        priority: "CRITICAL",
        position: side,
        proximity: "very close",
        message: `Close obstacle ${side}. ${evade}`,
        confidence: 99,
        source: "Sensor Fusion",
      };
    }

    if ((!detections || detections.length === 0) && !ultrasonicAlert) {
      return null;
    }

    // Rank detections by priority + proximity score
    const scoredDetections = (detections || []).map((det) => {
      const classKey = det.label.toLowerCase();
      const meta = OBSTACLE_PRIORITIES[classKey] || { priority: "MEDIUM", alertTemplate: `${det.label} ahead.` };
      let score = this.priorityWeights[meta.priority] || 30;

      // Proximity boost
      if (det.proximity === "very close") score += 30;
      else if (det.proximity === "close") score += 15;

      // Position center boost (obstacles straight ahead are more dangerous)
      if (det.position === "straight ahead") score += 10;

      return {
        ...det,
        priority: meta.priority,
        template: meta.alertTemplate,
        compositeScore: score,
      };
    });

    // Sort descending by score
    scoredDetections.sort((a, b) => b.compositeScore - a.compositeScore);

    // If an ultrasonic emergency alert occurred, it takes top precedence
    if (ultrasonicAlert) {
      if (now - this.lastSpokenTime > 2500 || this.lastSpokenText !== ultrasonicAlert.message) {
        this.lastSpokenText = ultrasonicAlert.message;
        this.lastSpokenTime = now;
        return ultrasonicAlert;
      }
    }

    // Process top candidate through memory filter (debounce repetition)
    for (const candidate of scoredDetections) {
      const memKey = candidate.label.toLowerCase();
      const previous = this.memory.get(memKey);

      let isSignificantChange = false;
      if (previous) {
        // Did proximity become closer?
        if (candidate.proximity === "very close" && previous.proximity !== "very close") {
          isSignificantChange = true;
        }
        // Did direction change?
        if (candidate.position !== previous.position) {
          isSignificantChange = true;
        }
      }

      const isExpired = !previous || (now - previous.timestamp > this.cooldownMs);

      if (isExpired || isSignificantChange) {
        // Format concise, actionable speech
        let message = "";
        const side = candidate.position;
        const label = candidate.label.charAt(0).toUpperCase() + candidate.label.slice(1);

        if (candidate.priority === "CRITICAL") {
          message = candidate.template || `Warning. ${label} ahead.`;
        } else if (side === "on your left") {
          message = `${label} on your left. Move slightly right.`;
        } else if (side === "on your right") {
          message = `${label} on your right. Move slightly left.`;
        } else {
          message = `${label} ahead. ${candidate.proximity === "very close" ? "Stop." : "Slow down."}`;
        }

        // Update memory
        this.memory.set(memKey, {
          timestamp: now,
          proximity: candidate.proximity,
          position: candidate.position,
        });

        this.lastSpokenText = message;
        this.lastSpokenTime = now;

        return {
          label: candidate.label,
          priority: candidate.priority,
          position: candidate.position,
          proximity: candidate.proximity,
          confidence: candidate.confidence,
          message,
          source: "CANIE Decision",
        };
      }
    }

    return null;
  }
}

// Global CANIE singleton instance
export const canie = new CanieEngine();

