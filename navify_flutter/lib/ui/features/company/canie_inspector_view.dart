import 'package:flutter/material.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';

class CanieInspectorView extends StatefulWidget {
  const CanieInspectorView({super.key});

  @override
  State<CanieInspectorView> createState() => _CanieInspectorViewState();
}

class _CanieInspectorViewState extends State<CanieInspectorView> {
  double _distanceMeters = 1.2;
  double _angleDegrees = 0.0; // -45 (Left) to +45 (Right)
  String _selectedClass = "Vehicle";

  @override
  Widget build(BuildContext context) {
    // Real-time CANIE rule calculation for testbench
    String priority = "MEDIUM";
    String action = "Proceed with caution.";

    if (_selectedClass == "Vehicle") {
      priority = _distanceMeters < 2.0 ? "CRITICAL" : "HIGH";
      action = _angleDegrees < -10 ? "Veer right immediately." : (_angleDegrees > 10 ? "Veer left immediately." : "Stop immediately.");
    } else if (_selectedClass == "Stairs / Dropoff") {
      priority = "CRITICAL";
      action = "Stop! Elevation change ahead.";
    } else if (_selectedClass == "Person") {
      priority = _distanceMeters < 1.5 ? "HIGH" : "MEDIUM";
      action = _angleDegrees < 0 ? "Pass on your right." : "Pass on your left.";
    }

    final isCritical = priority == "CRITICAL";

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        GlassContainer(
          borderRadius: 16,
          padding: const EdgeInsets.all(14),
          child: const Row(
            children: [
              Icon(Icons.tune_rounded, color: AppColors.primaryCyan, size: 22),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("CANIE RULE TESTBENCH", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryCyan)),
                    Text("Simulate Spatial Collision Inputs", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Controls
        GlassContainer(
          borderRadius: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Obstacle Class", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 6),
              DropdownButton<String>(
                value: _selectedClass,
                isExpanded: true,
                items: ["Vehicle", "Person", "Stairs / Dropoff", "Chair / Furniture", "Low Barrier"]
                    .map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedClass = val);
                },
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Distance", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                  Text("${_distanceMeters.toStringAsFixed(1)} m", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryCyan)),
                ],
              ),
              Slider(
                value: _distanceMeters,
                min: 0.3,
                max: 5.0,
                divisions: 47,
                activeColor: AppColors.primaryCyan,
                onChanged: (val) => setState(() => _distanceMeters = val),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Azimuth Angle", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                  Text(
                    _angleDegrees < 0 ? "${_angleDegrees.abs().toInt()}° Left" : (_angleDegrees > 0 ? "${_angleDegrees.toInt()}° Right" : "Center Ahead"),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.emeraldMint),
                  ),
                ],
              ),
              Slider(
                value: _angleDegrees,
                min: -45.0,
                max: 45.0,
                divisions: 90,
                activeColor: AppColors.emeraldMint,
                onChanged: (val) => setState(() => _angleDegrees = val),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Live CANIE Evaluated Output
        GlassContainer(
          borderRadius: 16,
          borderColor: isCritical ? AppColors.alertCoral : AppColors.primaryCyan,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("EVALUATED CANIE OUTPUT", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: (isCritical ? AppColors.alertCoral : AppColors.primaryCyan).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      priority,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isCritical ? AppColors.alertCoral : AppColors.primaryCyan,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                "$_selectedClass detected ${_distanceMeters.toStringAsFixed(1)}m ${_angleDegrees < -5 ? 'on left' : (_angleDegrees > 5 ? 'on right' : 'ahead')}. $action",
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, height: 1.3),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
      ],
    );
  }
}

