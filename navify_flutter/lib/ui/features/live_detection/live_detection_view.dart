import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';
import 'package:navify_app/data/models/detection_model.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';

class LiveDetectionView extends StatelessWidget {
  const LiveDetectionView({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Camera Viewfinder Box
        Container(
          height: 260,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primaryCyan.withOpacity(0.5), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryCyan.withOpacity(0.2),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Viewfinder Grid Overlay
              Positioned.fill(
                child: Opacity(
                  opacity: 0.15,
                  child: GridPaper(
                    color: AppColors.primaryCyan,
                    divisions: 2,
                    subdivisions: 1,
                  ),
                ),
              ),

              // Viewfinder HUD Elements
              Positioned(
                top: 14,
                left: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.emeraldMint),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.circle, size: 8, color: AppColors.emeraldMint),
                      SizedBox(width: 6),
                      Text("CAMERA FEED ACTIVE", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),

              Positioned(
                top: 14,
                right: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text("30 FPS · 77° FOV", style: TextStyle(color: Colors.white70, fontSize: 10)),
                ),
              ),

              // Simulated / Detected Bounding Box
              if (vm.liveDetections.isNotEmpty)
                Center(
                  child: Container(
                    width: 140,
                    height: 180,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.emeraldMint, width: 2),
                      borderRadius: BorderRadius.circular(8),
                      color: AppColors.emeraldMint.withOpacity(0.12),
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          top: 4,
                          left: 6,
                          child: Text(
                            "${vm.liveDetections.first.label} ${vm.liveDetections.first.confidence}%",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              backgroundColor: Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.center_focus_strong, color: AppColors.primaryCyan, size: 48),
                      SizedBox(height: 8),
                      Text("CANIE Vision Engine Active", style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),

              // Bottom HUD: Ultrasonic Sensor Floor Readouts
              Positioned(
                bottom: 12,
                left: 14,
                right: 14,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Ultrasonic L: ${vm.telemetry.leftUltrasonicCm}cm", style: const TextStyle(color: Colors.white70, fontSize: 11)),
                    Text("Ultrasonic R: ${vm.telemetry.rightUltrasonicCm}cm", style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Real-Time CANIE Voice Guidance Banner
        GlassContainer(
          borderRadius: 16,
          padding: const EdgeInsets.all(14),
          borderColor: vm.currentGuidance.priority == "CRITICAL" ? AppColors.alertCoral : AppColors.primaryCyan,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (vm.currentGuidance.priority == "CRITICAL" ? AppColors.alertCoral : AppColors.primaryCyan).withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.campaign_rounded,
                  color: vm.currentGuidance.priority == "CRITICAL" ? AppColors.alertCoral : AppColors.primaryCyan,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "CANIE VOICE GUIDANCE",
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: vm.currentGuidance.priority == "CRITICAL" ? AppColors.alertCoral : AppColors.primaryCyan),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      vm.currentGuidance.message,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Live Vision Simulator / Quick Test Buttons (Essential for Presentation & Demo)
        const Text("Interactive Demonstration Controls", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _TestChip(
              label: "Person (Ahead · 1.4m)",
              color: AppColors.emeraldMint,
              onTap: () {
                vm.setDetections([
                  DetectedObject(
                    id: "sim-1",
                    label: "Person",
                    confidence: 96,
                    position: "straight ahead",
                    proximity: "1.4m (nearby)",
                    priority: "HIGH",
                    timestamp: "Now",
                  )
                ]);
              },
            ),
            _TestChip(
              label: "Chair (Right · 0.8m)",
              color: AppColors.primaryCyan,
              onTap: () {
                vm.setDetections([
                  DetectedObject(
                    id: "sim-2",
                    label: "Chair",
                    confidence: 91,
                    position: "on your right",
                    proximity: "0.8m (close)",
                    priority: "MEDIUM",
                    timestamp: "Now",
                  )
                ]);
              },
            ),
            _TestChip(
              label: "Vehicle (Left · Critical)",
              color: AppColors.alertCoral,
              onTap: () {
                vm.setDetections([
                  DetectedObject(
                    id: "sim-3",
                    label: "Vehicle",
                    confidence: 98,
                    position: "on your left",
                    proximity: "1.1m (close)",
                    priority: "CRITICAL",
                    timestamp: "Now",
                  )
                ]);
              },
            ),
            _TestChip(
              label: "Clear Path (All Safe)",
              color: Colors.grey,
              onTap: () {
                vm.setDetections([]);
              },
            ),
          ],
        ),

        const SizedBox(height: 18),

        // Recent Detections List
        const Text("Session Obstacle Detections", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey)),
        const SizedBox(height: 8),
        ...vm.detectionHistory.take(4).map((d) => _DetectionTile(detection: d)),

        const SizedBox(height: 20),
      ],
    );
  }
}

class _TestChip extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _TestChip({required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      onPressed: onTap,
      label: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      backgroundColor: color.withOpacity(0.12),
      side: BorderSide(color: color.withOpacity(0.4)),
    );
  }
}

class _DetectionTile extends StatelessWidget {
  final DetectedObject detection;

  const _DetectionTile({required this.detection});

  @override
  Widget build(BuildContext context) {
    Color badgeColor = AppColors.primaryCyan;
    if (detection.priority == "CRITICAL") badgeColor = AppColors.alertCoral;
    if (detection.priority == "HIGH") badgeColor = AppColors.emeraldMint;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        borderRadius: 12,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: badgeColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.warning_amber_rounded, size: 18, color: badgeColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${detection.label} (${detection.confidence}%)",
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    "${detection.position} · ${detection.proximity}",
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Text(
              detection.timestamp,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

