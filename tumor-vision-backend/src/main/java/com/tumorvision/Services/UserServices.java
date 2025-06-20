package com.tumorvision.Services;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tumorvision.DAO.UserRepository;
import com.tumorvision.Entity.Users;

@Service
public class UserServices {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JavaMailSender mailSender;

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ConcurrentHashMap<String, Users> otpStore = new ConcurrentHashMap<>();

    /**
     * 1) Register: check uniqueness, hash password, set PENDING status,
     *    generate OTP, store in-memory, and email the OTP.
     */
    @Transactional
    public void saveUser(Users user) throws Exception {
        // 1a) Check email uniqueness
        boolean exists = mongoTemplate.exists(
            org.springframework.data.mongodb.core.query.Query.query(
                org.springframework.data.mongodb.core.query.Criteria.where("email").is(user.getEmail())
            ),
            Users.class
        );
        if (exists) {
            throw new Exception("Email already exists.");
        }

        // 1b) Prepare user record
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER"));
        user.setStatus("PENDING");
        user.setVerificationToken(generateOTP());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // 1c) Store temporarily and send OTP
        otpStore.put(user.getEmail(), user);
        sendVerificationEmail(user.getEmail(), user.getVerificationToken());
    }

    /**
     * 2) Verify email + OTP → persist user with ACTIVE status.
     */
    @Transactional
    public void verifyEmail(String email, String otp) throws Exception {
        Users user = otpStore.get(email);
        if (user == null || !user.getVerificationToken().equals(otp)) {
            throw new Exception("Invalid verification token.");
        }

        // Persist and clear OTP store
        otpStore.remove(email);
        user.setStatus("ACTIVE");
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    /**
     * 3) Resend OTP if registration is still pending.
     */
    public void resendOtp(String email) throws Exception {
        Users user = otpStore.get(email);
        if (user == null) {
            throw new Exception("No pending registration for that email.");
        }
        String newOtp = generateOTP();
        user.setVerificationToken(newOtp);
        user.setUpdatedAt(LocalDateTime.now());
        otpStore.put(email, user);
        sendVerificationEmail(email, newOtp);
    }

    /**
     * 4) Login: validate credentials and ensure status is ACTIVE.
     *
     * @return the authenticated Users object, or null if invalid.
     */
    public Users validateUser(String email, String rawPassword) {
        Users user = userRepository.findByEmail(email);
        if (user != null
         && passwordEncoder.matches(rawPassword, user.getPassword())
         && "ACTIVE".equals(user.getStatus())) {
            return user;
        }
        return null;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Generates a random 6-digit OTP. */
    private String generateOTP() {
        SecureRandom rnd = new SecureRandom();
        int n = 100000 + rnd.nextInt(900000);
        return String.valueOf(n);
    }

    /** Sends a simple verification email with the given OTP. */
    private void sendVerificationEmail(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("TumorVision Account Verification");
        msg.setText(
            "Welcome to TumorVision!\n\n" +
            "Your verification code: " + otp + "\n\n" +
            "Enter this code in the app to activate your account."
        );
        mailSender.send(msg);
    }
}
