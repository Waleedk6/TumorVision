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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tumorvision.DAO.UserRepository;
import com.tumorvision.Entity.Users;

@Service
public class UserServices {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

private static final Logger log = LoggerFactory.getLogger(UserServices.class);

    @Autowired
    private JavaMailSender mailSender;

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ConcurrentHashMap<String, Users> otpStore = new ConcurrentHashMap<>();

    /**
     * 1) Register:
     * - check uniqueness,
     * - hash password,
     * - set PENDING status,
     * - generate OTP,
     * - store in-memory,
     * - email the OTP.
     */
    @Transactional
    public void saveUser(Users user) throws Exception {
        log.info("Starting user registration for email: {}", user.getEmail());

        try {
            // a) ensure email not already in use
            boolean exists = mongoTemplate.exists(
                    org.springframework.data.mongodb.core.query.Query.query(
                            org.springframework.data.mongodb.core.query.Criteria.where("email")
                                    .is(user.getEmail())),
                    Users.class);

            log.debug("Email existence check completed for: {}", user.getEmail());

            if (exists) {
                log.warn("Registration attempt with existing email: {}", user.getEmail());
                throw new Exception("Email already exists.");
            }

            // b) Log pre-hash password details
            log.debug("Original password length: {}", user.getPassword() != null ? user.getPassword().length() : 0);

            // c) prepare the transient user record
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRoles(Arrays.asList("PATIENT"));
            user.setStatus("PENDING");
            user.setVerificationToken(generateOTP());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            // d) Log post-processing details
            log.debug("Hashed password: {}", user.getPassword());
            log.debug("Assigned roles: {}", user.getRoles());
            log.debug("Generated OTP: {}", user.getVerificationToken());

            // e) hold in-memory until OTP is verified
            otpStore.put(user.getEmail(), user);
            log.info("User data prepared for email: {}", user.getEmail());

            sendVerificationEmail(user.getEmail(), user.getVerificationToken());
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error during user registration for email: {}", user.getEmail(), e);
            throw e;
        }
    }

    /**
     * 2) Verify email & OTP → persist user with PASS status.
     */
    @Transactional
    public void verifyEmail(String email, String otp) throws Exception {
        Users pending = otpStore.get(email);
        if (pending == null || !pending.getVerificationToken().equals(otp)) {
            throw new Exception("Invalid or expired verification token.");
        }

        // persist and clear the OTP-store
        otpStore.remove(email);
        pending.setStatus("PASS");
        pending.setVerificationToken(null);
        userRepository.save(pending);
    }

    /**
     * 3) Resend OTP (only if still PENDING).
     */
    public void resendOtp(String email) throws Exception {
        Users pending = otpStore.get(email);
        if (pending == null) {
            throw new Exception("No pending registration found for that email.");
        }
        String newOtp = generateOTP();
        pending.setVerificationToken(newOtp);
        pending.setUpdatedAt(LocalDateTime.now());
        otpStore.put(email, pending);
        sendVerificationEmail(email, newOtp);
    }

    /**
     * 4) Login: validate creds + require PASS status.
     * 
     * @return the authenticated user, or null if invalid/never verified.
     */
    public Users validateUser(String email, String rawPassword) {
        Users stored = userRepository.findByEmail(email);
        if (stored != null
                && passwordEncoder.matches(rawPassword, stored.getPassword())
                && "PASS".equals(stored.getStatus())) {
            return stored;
        }
        return null;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Random 6-digit OTP. */
    private String generateOTP() {
        SecureRandom rnd = new SecureRandom();
        int n = 100000 + rnd.nextInt(900000);
        return String.valueOf(n);
    }

    /** Send the OTP in a simple mail. */
    private void sendVerificationEmail(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("TumorVision Account Verification");
        msg.setText(
                "Welcome to TumorVision!\n\n" +
                        "Your verification code: " + otp + "\n\n" +
                        "Enter this code in the app to activate your account.");
        mailSender.send(msg);
    }
}
