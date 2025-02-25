import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart'; // For token storage

class AuthService {
  static const String baseUrl = 'http://localhost:3000';

  // Save the token to shared preferences after successful login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Store token in shared preferences
        final prefs = await SharedPreferences.getInstance();
        prefs.setString('auth_token', data['token']); // Save the token

        return {'success': true, 'message': 'Login successful', 'token': data['token']};
      } else {
        return {'success': false, 'message': 'Invalid credentials'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Server error: $e'};
    }
  }

  // Retrieve token from shared preferences
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
}
