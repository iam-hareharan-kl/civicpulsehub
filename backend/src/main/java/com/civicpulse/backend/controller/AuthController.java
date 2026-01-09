package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.AuthRequest;
import com.civicpulse.backend.dto.AuthResponse;
import com.civicpulse.backend.dto.RegisterRequest;
import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import com.civicpulse.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.backend.service.EmailService; // Import this
import java.util.Map; // Import this
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, "Email already exists"));
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        // --- NEW LOGIC ---
        // Citizens are auto-approved
        user.setApproved(!"OFFICER".equals(request.getRole())); // Officers need approval

        userRepository.save(user);

        String msg = "User registered successfully";
        if (!user.isApproved()) {
            msg = "Registration successful. Please wait for Admin approval.";
        }

        return ResponseEntity.ok(new AuthResponse(null, user.getRole(), msg));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null && passwordEncoder.matches(request.getPassword(), user.getPassword())) {

            // --- CHECK APPROVAL ---
            if (!user.isApproved() && !"ADMIN".equals(user.getRole()) && !"CITIZEN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponse(null, null, "Your account is not approved yet."));
            }

            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token, user.getRole(), "Login successful"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, "Invalid email or password"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Return OK to avoid enumerating valid emails
            return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
        }

        String resetToken = jwtService.generateToken(user.getEmail(), user.getRole());
        // Note: You will need a frontend route for /reset-password later
        String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;

        emailService.sendSimpleEmail(
                user.getEmail(),
                "Password Reset Request",
                "Click the link to reset your password: " + resetLink
        );

        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and password are required"));
        }

        try {
            // 1. Extract email from token
            String email = jwtService.extractUsername(token);

            // 2. Find user
            User user = userRepository.findByEmail(email).orElse(null);

            // 3. Validate token belonging to user
            if (user == null || !jwtService.isTokenValid(token, user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Invalid or expired reset token."));
            }

            // 4. Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Invalid token."));
        }
    }
}