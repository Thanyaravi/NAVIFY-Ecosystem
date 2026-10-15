import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/ui/core/app_theme.dart';
import 'package:navify_app/ui/core/glass_container.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';

class TopBar extends StatelessWidget {
  const TopBar({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        borderRadius: 20,
        child: Row(
          children: [
            // Brand Logo & Name
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryCyan, AppColors.primarySapphire],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "NAVIFY",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  vm.role == "user" ? "ASSISTIVE CLIENT" : "DEV CONSOLE",
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryCyan,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
            const Spacer(),

            // Role Switcher (User <-> Company)
            Container(
              decoration: BoxDecoration(
                color: isDark ? Colors.black26 : Colors.black12,
                borderRadius: BorderRadius.circular(20),
              ),
              padding: const EdgeInsets.all(3),
              child: Row(
                children: [
                  _RoleButton(
                    title: "User",
                    isSelected: vm.role == "user",
                    onTap: () => vm.setRole("user"),
                  ),
                  _RoleButton(
                    title: "Company",
                    isSelected: vm.role == "company",
                    onTap: () => vm.setRole("company"),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Theme Toggle (Dark / Light)
            IconButton(
              icon: Icon(
                isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                size: 20,
                color: isDark ? AppColors.textDarkSecondary : AppColors.textLightSecondary,
              ),
              onPressed: () => vm.toggleTheme(),
              tooltip: "Toggle Theme",
              visualDensity: VisualDensity.compact,
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleButton({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryCyan : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : (Theme.of(context).brightness == Brightness.dark ? AppColors.textDarkSecondary : AppColors.textLightSecondary),
          ),
        ),
      ),
    );
  }
}

