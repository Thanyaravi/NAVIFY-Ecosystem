import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';
import 'package:navify_app/data/models/sos_event_model.dart';

class SOSCenterView extends StatelessWidget {
  const SOSCenterView({super.key});

  void _showEditContactDialog(BuildContext context, AppViewModel vm, EmergencyContact? contact) {
    final nameCtrl = TextEditingController(text: contact?.name ?? '');
    final relationCtrl = TextEditingController(text: contact?.relation ?? '');
    final phoneCtrl = TextEditingController(text: contact?.phone ?? '');
    bool isPrimary = contact?.isPrimary ?? false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: Theme.of(ctx).cardTheme.color,
          title: Text(contact == null ? "Add Emergency Contact" : "Edit Contact & Phone Number", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: "Full Name (e.g. Vikram Sir)"),
              ),
              TextField(
                controller: relationCtrl,
                decoration: const InputDecoration(labelText: "Relation (e.g. Mentor / Doctor)"),
              ),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: "Real Phone Number (e.g. +91 98450...)"),
              ),
              const SizedBox(height: 12),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text("Set as Primary SOS Auto-Dial", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                value: isPrimary,
                onChanged: (val) => setState(() => isPrimary = val ?? false),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                if (phoneCtrl.text.trim().isNotEmpty) {
                  if (contact != null) {
                    vm.updateContact(contact.id, nameCtrl.text.trim(), relationCtrl.text.trim(), phoneCtrl.text.trim(), isPrimary);
                  } else {
                    vm.addContact(nameCtrl.text.trim(), relationCtrl.text.trim(), phoneCtrl.text.trim(), isPrimary);
                  }
                  Navigator.pop(ctx);
                }
              },
              child: const Text("Save Number"),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // SOS Broadcast Status Header
        GlassContainer(
          borderRadius: 16,
          padding: const EdgeInsets.all(14),
          borderColor: vm.sosActive ? AppColors.alertCoral : AppColors.emeraldMint,
          child: Row(
            children: [
              Icon(
                vm.sosActive ? Icons.notifications_active_rounded : Icons.shield_rounded,
                color: vm.sosActive ? AppColors.alertCoral : AppColors.emeraldMint,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vm.sosActive ? "EMERGENCY BROADCAST ACTIVE" : "SOS SYSTEM ARMED",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: vm.sosActive ? AppColors.alertCoral : AppColors.emeraldMint,
                      ),
                    ),
                    Text(
                      vm.sosActive
                          ? "Alert pushed to emergency contacts & cloud dispatch"
                          : "Auto Fall Detection & GPS Active",
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              if (vm.sosActive)
                TextButton(
                  onPressed: () => vm.resolveSOS(vm.sosEvents.first.id),
                  child: const Text("CANCEL", style: TextStyle(color: AppColors.alertCoral, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Glowing Circular SOS Button
        Center(
          child: GestureDetector(
            onTap: () => vm.triggerSOS(),
            child: Container(
              width: 170,
              height: 170,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [
                    Color(0xFFFF3B30),
                    Color(0xFFDC2626),
                    Color(0xFF991B1B),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withValues(alpha: vm.sosActive ? 0.7 : 0.4),
                    blurRadius: vm.sosActive ? 36 : 20,
                    spreadRadius: vm.sosActive ? 8 : 2,
                  ),
                ],
                border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 3),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.touch_app_rounded, color: Colors.white, size: 36),
                  SizedBox(height: 4),
                  Text(
                    "SOS",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                    ),
                  ),
                  Text(
                    "TAP TO TRIGGER",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Auto-Call on SOS Toggle
        GlassContainer(
          borderRadius: 14,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Row(
            children: [
              const Icon(Icons.phone_forwarded_rounded, color: AppColors.primaryCyan, size: 20),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Auto-Dial Primary Contact", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    Text("Automatically initiates real phone call when SOS is tapped", style: TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
              Switch(
                value: vm.autoCallOnSos,
                activeColor: AppColors.emeraldMint,
                onChanged: (_) => vm.toggleAutoCallOnSos(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // GPS Location Card
        GlassContainer(
          borderRadius: 16,
          child: const Row(
            children: [
              Icon(Icons.location_on_rounded, color: AppColors.primaryCyan, size: 22),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Acquired GPS Coordinates", style: TextStyle(fontSize: 11, color: Colors.grey)),
                    Text(
                      "12.9716° N, 77.5946° E (Bengaluru)",
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Emergency Contacts Header & Add Contact Button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("Emergency Contacts (Tap Call to Dial)", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey)),
            TextButton.icon(
              onPressed: () => _showEditContactDialog(context, vm, null),
              icon: const Icon(Icons.add, size: 16),
              label: const Text("Add Number", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // Contacts list
        ...vm.contacts.map((c) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassContainer(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                borderRadius: 14,
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: c.isPrimary ? AppColors.primaryCyan : Colors.grey.withValues(alpha: 0.3),
                      radius: 18,
                      child: Text(
                        c.name.substring(0, 1),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(c.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                              if (c.isPrimary) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryCyan.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text("PRIMARY", style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppColors.primaryCyan)),
                                ),
                              ],
                            ],
                          ),
                          Text("${c.relation} · ${c.phone}", style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 18, color: Colors.grey),
                      onPressed: () => _showEditContactDialog(context, vm, c),
                      tooltip: "Edit real phone number",
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone_rounded, color: AppColors.emeraldMint, size: 22),
                      onPressed: () => vm.callContact(c.phone),
                      tooltip: "Call now",
                    ),
                  ],
                ),
              ),
            )),

        const SizedBox(height: 16),

        // Incident Log History
        const Text("Incident Logs", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey)),
        const SizedBox(height: 8),
        ...vm.sosEvents.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassContainer(
                padding: const EdgeInsets.all(12),
                borderRadius: 12,
                child: Row(
                  children: [
                    Icon(
                      e.status == "ACTIVE" ? Icons.error_outline : Icons.check_circle_outline,
                      color: e.status == "ACTIVE" ? AppColors.alertCoral : AppColors.emeraldMint,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("${e.timestamp} · ${e.status}", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          Text(e.resolutionNote, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )),

        const SizedBox(height: 20),
      ],
    );
  }
}
