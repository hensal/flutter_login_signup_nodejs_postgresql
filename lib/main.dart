import 'package:demo_app/forgot_password.dart';
import 'package:demo_app/home_screen.dart';
import 'package:demo_app/login_screen.dart';
import 'package:demo_app/reset_password_screen.dart';
import 'package:demo_app/sign_up_screen.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

void main() {
  setUrlStrategy(PathUrlStrategy()); // Enables browser history API
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final GoRouter _router = GoRouter(
    debugLogDiagnostics: true, // Enable this for debugging
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return LoginPage(email: email);
        },
      ),

      GoRoute(
        path: '/create-account',
        builder: (context, state) => const CreateAccountPage(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final String? email = state.uri.queryParameters['email'];
          print(
              "Navigating to reset password page with email: $email"); // Debugging
          return ResetPasswordPage(email: email ?? '');
        },
      ),
      // Add a route for the HomeScreen
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );

  MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
