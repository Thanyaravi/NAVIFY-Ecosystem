import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';

class TelemetryDashboardView extends StatelessWidget {
  const TelemetryDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Company Diagnostic Header
        GlassContainer(
          borderRadius: 16,
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryCyan.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.developer_board_rounded, color: AppColors.primaryCyan, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("ENGINEERING DIAGNOSTICS", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryCyan)),
                    Text("Radxa ZERO 3W (RK3566) Telemetry", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Compute & NPU Card
        GlassContainer(
          borderRadius: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.memory, color: AppColors.primaryCyan, size: 18),
                  SizedBox(width: 8),
                  Text("RKNN NPU & CPU State", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              _MetricRow("SoC Temperature", "${vm.telemetry.temperatureCelsius} °C", "Passive Heat Spreader"),
              _MetricRow("NPU Inference Speed", "${vm.telemetry.npuFps} FPS", "MobileNet Int8"),
              _MetricRow("Pipeline Latency", "${vm.telemetry.npuLatencyMs} ms", "Camera to Decision"),
              _MetricRow("System RAM", "4 GB LPDDR4", "42% Utilized"),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Dual JSN-SR04T Rangefinding Card
        GlassContainer(
          borderRadius: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.radar_rounded, color: AppColors.emeraldMint, size: 18),
                  SizedBox(width: 8),
                  Text("Dual Ultrasonic Array (JSN-SR04T)", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              _MetricRow("Left Sensor (30° Offset)", "${vm.telemetry.leftUltrasonicCm} cm", "0.2m - 4.5m range"),
              _MetricRow("Right Sensor (30° Offset)", "${vm.telemetry.rightUltrasonicCm} cm", "0.2m - 4.5m range"),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 2S Power System Telemetry
        GlassContainer(
          borderRadius: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.bolt_rounded, color: AppColors.warningAmber, size: 18),
                  SizedBox(width: 8),
                  Text("2S 18650 Power Distribution", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              _MetricRow("Pack Total Voltage", "${vm.telemetry.batteryVoltage} V", "2S Series (Molicel P30B)"),
              _MetricRow("Cell 1 / Cell 2", "${vm.telemetry.cell1Voltage}V / ${vm.telemetry.cell2Voltage}V", "20A Balanced BMS"),
              _MetricRow("Regulated 5V Rail", "${vm.telemetry.regulator5vRail} V", "MP1584 Buck Regulator"),
              _MetricRow("Current Draw", "${vm.telemetry.currentDrawMa} mA", "Steady Run-time: ~5.2h"),
            ],
          ),
        ),

        const SizedBox(height: 20),
      ],
    );
  }
}

class _MetricRow extends StatelessWidget {
  final String label;
  final String value;
  final String note;

  const _MetricRow(this.label, this.value, this.note);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              Text(note, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primaryCyan),
          ),
        ],
      ),
    );
  }
}

