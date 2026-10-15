import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:navify_app/main.dart';
import 'package:navify_app/ui/view_models/app_view_model.dart';

void main() {
  testWidgets('NAVIFY App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppViewModel(),
        child: const NavifyApp(),
      ),
    );

    // Verify NAVIFY Brand is rendered
    expect(find.text('NAVIFY'), findsOneWidget);
  });
}
