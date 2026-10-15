import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'ui/core/app_theme.dart';
import 'ui/view_models/app_view_model.dart';
import 'ui/features/shared/top_bar.dart';
import 'ui/features/dashboard/dashboard_view.dart';
import 'ui/features/live_detection/live_detection_view.dart';
import 'ui/features/sos/sos_center_view.dart';
import 'ui/features/company/telemetry_dashboard_view.dart';
import 'ui/features/company/canie_inspector_view.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppViewModel(),
      child: const NavifyApp(),
    ),
  );
}

class NavifyApp extends StatelessWidget {
  const NavifyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();

    return MaterialApp(
      title: 'NAVIFY Assistive Ecosystem',
      debugShowCheckedModeBanner: false,
      themeMode: vm.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppViewModel>();
    final isUser = vm.role == "user";

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const TopBar(),
            Expanded(
              child: isUser
                  ? _buildUserScreen(vm.activeTabIndex)
                  : _buildCompanyScreen(vm.activeTabIndex),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color?.withOpacity(0.9),
          border: Border(
            top: BorderSide(
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkBorder
                  : AppColors.lightBorder,
              width: 1,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: vm.activeTabIndex.clamp(0, isUser ? 2 : 1),
          onDestinationSelected: (index) => vm.setActiveTab(index),
          backgroundColor: Colors.transparent,
          indicatorColor: AppColors.primaryCyan.withOpacity(0.2),
          destinations: isUser
              ? const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    selectedIcon: Icon(Icons.dashboard, color: AppColors.primaryCyan),
                    label: "Dashboard",
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.camera_alt_outlined),
                    selectedIcon: Icon(Icons.camera_alt, color: AppColors.primaryCyan),
                    label: "Live Camera",
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.health_and_safety_outlined),
                    selectedIcon: Icon(Icons.health_and_safety, color: AppColors.alertCoral),
                    label: "SOS Safety",
                  ),
                ]
              : const [
                  NavigationDestination(
                    icon: Icon(Icons.developer_board_outlined),
                    selectedIcon: Icon(Icons.developer_board, color: AppColors.primaryCyan),
                    label: "Telemetry",
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.tune_outlined),
                    selectedIcon: Icon(Icons.tune, color: AppColors.primaryCyan),
                    label: "CANIE Test",
                  ),
                ],
        ),
      ),
    );
  }

  Widget _buildUserScreen(int index) {
    switch (index) {
      case 0:
        return const DashboardView();
      case 1:
        return const LiveDetectionView();
      case 2:
        return const SOSCenterView();
      default:
        return const DashboardView();
    }
  }

  Widget _buildCompanyScreen(int index) {
    switch (index) {
      case 0:
        return const TelemetryDashboardView();
      case 1:
        return const CanieInspectorView();
      default:
        return const TelemetryDashboardView();
    }
  }
}

