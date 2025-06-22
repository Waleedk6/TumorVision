package com.tumorvision.Controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tumorvision.DAO.UserRepository;
import com.tumorvision.Entity.Users;
import com.tumorvision.Services.UserServices;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/user")
public class PublicController {

    @Autowired
    private UserServices userServices;

    @Autowired
    private UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(PublicController.class);

    /**
     * Signup step 1: save basic user info with PENDING status
     * (you can send back a message or DTO as needed)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Users user) {
        try {
            // Add detailed request logging
            log.info("Registration request received for email: {}", user.getEmail());
            log.debug("Full registration data - Username: {}, Email: {}, Password: [PROTECTED]",
                    user.getUsername(),
                    user.getEmail());

            // Log the complete user object (except password)
            Users sanitizedUser = new Users();
            sanitizedUser.setUsername(user.getUsername());
            sanitizedUser.setEmail(user.getEmail());
            sanitizedUser.setRoles(user.getRoles());
            log.debug("User object details: {}", sanitizedUser);

            userServices.saveUser(user);

            log.info("Registration successful for email: {}", user.getEmail());
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Content-Type", "text/plain")
                    .body("User registered. Please verify your email.");
        } catch (Exception e) {
            log.error("Registration failed for email: {}", user != null ? user.getEmail() : "unknown", e);

            // Return more structured error information
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Registration failed");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", Instant.now().toString());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * Signup step 2: verify email via OTP
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestParam("email") String email,
            @RequestParam("otp") String otp) {
        try {
            userServices.verifyEmail(email, otp);
            Users verified = userRepository.findByEmail(email);
            return ResponseEntity.ok(verified);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email verification failed: " + e.getMessage());
        }
    }

    /**
     * Signup step 3: resend OTP if needed
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        try {
            userServices.resendOtp(body.get("email"));
            return ResponseEntity.ok("OTP resent successfully.");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Resend failed: " + e.getMessage());
        }
    }

    /**
     * Login
     */
@PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody Users user) {
    Logger logger = LoggerFactory.getLogger(PublicController.class);
    logger.info("Login attempt received for email: {}", user.getEmail());

    try {
        // Check if input is valid
        if (user.getEmail() == null || user.getPassword() == null) {
            logger.warn("Login failed - Missing email or password in request.");
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Email and password must be provided"));
        }

        // Validate user
        Users foundUser = userServices.validateUser(user.getEmail(), user.getPassword());

        if (foundUser == null) {
            logger.warn("Login failed - No matching user found or invalid credentials for email: {}", user.getEmail());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Invalid email or password"));
        }

        logger.info("Login successful for user: {}", foundUser.getEmail());

        // Build a clean response payload (avoid sending password)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", Map.of(
                "id", foundUser.getId(),
                "email", foundUser.getEmail(),
                "username", foundUser.getUsername(),
                "roles", foundUser.getRoles(),
                "status", foundUser.getStatus()
        ));

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        logger.error("Unexpected error during login for email {}: {}", user.getEmail(), e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "message", "Login failed due to server error. Please try again later."));
    }
}

}
