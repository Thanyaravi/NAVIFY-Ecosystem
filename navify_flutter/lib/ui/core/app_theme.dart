import 'package:flutter/material.dart';

class AppColors {
  // Midnight Navy & Deep Backgrounds (Dark Mode)
  static const Color darkBg = Color(0xFF080D1A);
  static const Color darkCard = Color(0xFF0F172A);
  static const Color darkGlass = Color(0x331E293B);
  static const Color darkBorder = Color(0x2238BDF8);

  // Crisp Frosted Whites (Light Mode)
  static const Color lightBg = Color(0xFFF8FAFC);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightGlass = Color(0xCCFFFFFF);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // Accents (Strictly Electric Cyan & Emerald Mint - No Emergent Purple)
  static const Color primaryCyan = Color(0xFF0EA5E9);
  static const Color primarySapphire = Color(0xFF0284C7);
  static const Color emeraldMint = Color(0xFF10B981);
  static const Color alertCoral = Color(0xFFEF4444);
  static const Color warningAmber = Color(0xFFF59E0B);

  // Text Colors
  static const Color textDarkPrimary = Color(0xFFF8FAFC);
  static const Color textDarkSecondary = Color(0xFF94A3B8);
  static const Color textLightPrimary = Color(0xFF0F172A);
  static const Color textLightSecondary = Color(0xFF64748B);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBg,
      primaryColor: AppColors.primaryCyan,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryCyan,
        secondary: AppColors.emeraldMint,
        error: AppColors.alertCoral,
        surface: AppColors.darkCard,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.darkBorder, width: 1),
        ),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBg,
      primaryColor: AppColors.primarySapphire,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primarySapphire,
        secondary: AppColors.emeraldMint,
        error: AppColors.alertCoral,
        surface: AppColors.lightCard,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightCard,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.lightBorder, width: 1),
        ),
      ),
    );
  }
}

