package com.tumorvision.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tumorvision.DAO.UserRepository;
import com.tumorvision.Entity.Users;
import com.tumorvision.Services.UserServices;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/auth")
public class PublicController {

    @Autowired
    private UserServices userServices;

    @Autowired
    private UserRepository userRepository;

    /** 
     * Signup step 1: save basic user info with PENDING status 
     * (you can send back a message or DTO as needed)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Users user) {
        try {
            userServices.saveUser(user);  // second arg null since this is basic info only
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("User registered. Please verify your email.");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
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
    public ResponseEntity<?> resendOtp(@RequestBody Map<String,String> body) {
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
        try {
            Users found = userServices.validateUser(user.getEmail(), user.getPassword());
            if (found == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid email or password");
            }
            if (!"PASS".equals(found.getStatus())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Please verify your email first.");
            }
            Map<String,Object> resp = new HashMap<>();
            resp.put("user", found);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }
}
