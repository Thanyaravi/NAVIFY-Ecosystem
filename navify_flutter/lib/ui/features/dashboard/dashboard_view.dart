import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Welcome Banner & Voice Guidance Status
        GlassContainer(
          borderRadius: 20,
          padding: const EdgeInsets.all(18),
          borderColor: vm.currentGuidance.priority == "CRITICAL"
              ? AppColors.alertCoral
              : AppColors.primaryCyan.withOpacity(0.35),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.emeraldMint.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.emeraldMint.withOpacity(0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.emeraldMint,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        const Text(
                          "CANIE ACTIVE",
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.emeraldMint,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  const Icon(Icons.volume_up_rounded, color: AppColors.primaryCyan, size: 20),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                "Real-Time Guidance",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey),
              ),
              const SizedBox(height: 4),
              Text(
                vm.currentGuidance.message,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Quick Launch Camera Detection
        GestureDetector(
          onTap: () => vm.setActiveTab(1), // Switch to Camera Detection
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryCyan, AppColors.primarySapphire],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryCyan.withOpacity(0.35),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.camera_alt_rounded, color: Colors.white, size: 22),
                SizedBox(width: 10),
                Text(
                  "Launch Camera Assist",
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // 2x2 Metric Grid
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.35,
          children: [
            _MetricCard(
              title: "Journey Today",
              value: "2.4",
              unit: "km",
              sub: "+18% vs avg",
              icon: Icons.navigation_outlined,
              accentColor: AppColors.primaryCyan,
            ),
            _MetricCard(
              title: "Battery Health",
              value: "${vm.telemetry.batteryPercentage}",
              unit: "%",
              sub: "${vm.telemetry.batteryVoltage}V (2S Pack)",
              icon: Icons.battery_charging_full_rounded,
              accentColor: AppColors.emeraldMint,
            ),
            _MetricCard(
              title: "Detections",
              value: "${vm.detectionHistory.length + 31}",
              unit: "",
              sub: "+14 in session",
              icon: Icons.remove_red_eye_outlined,
              accentColor: AppColors.primarySapphire,
            ),
            _MetricCard(
              title: "SOS Status",
              value: vm.sosActive ? "ALERT" : "Safe",
              unit: "",
              sub: vm.sosActive ? "Broadcast active" : "All clear",
              icon: Icons.health_and_safety_outlined,
              accentColor: vm.sosActive ? AppColors.alertCoral : AppColors.emeraldMint,
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Radxa ZERO 3W Cane Hardware Card
        GlassContainer(
          borderRadius: 20,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.memory_rounded, color: AppColors.primaryCyan, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    "Radxa ZERO 3W Hardware Status",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.emeraldMint.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      "ONLINE",
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.emeraldMint),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              _DetailRow(
                label: "Processor",
                value: "Radxa ZERO 3W (RK3566, 4GB)",
              ),
              _DetailRow(
                label: "Thermal",
                value: "${vm.telemetry.temperatureCelsius}°C (Fanless Passive)",
              ),
              _DetailRow(
                label: "Dual Ultrasonics",
                value: "L: ${vm.telemetry.leftUltrasonicCm}cm | R: ${vm.telemetry.rightUltrasonicCm}cm",
              ),
              _DetailRow(
                label: "Motion State",
                value: vm.telemetry.motionState,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String unit;
  final String sub;
  final IconData icon;
  final Color accentColor;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.unit,
    required this.sub,
    required this.icon,
    required this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(12),
      borderRadius: 16,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey),
              ),
              Icon(icon, size: 16, color: accentColor),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: accentColor,
                ),
              ),
              if (unit.isNotEmpty) ...[
                const SizedBox(width: 3),
                Text(
                  unit,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey),
                ),
              ],
            ],
          ),
          Text(
            sub,
            style: const TextStyle(fontSize: 9, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

