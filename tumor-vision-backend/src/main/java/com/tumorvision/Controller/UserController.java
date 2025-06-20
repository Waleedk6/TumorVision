package com.fitnesstan.fitnesstan_backend.Controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.fitnesstan.fitnesstan_backend.DAO.UserRepository;
import com.fitnesstan.fitnesstan_backend.Entity.Users;
import com.fitnesstan.fitnesstan_backend.Entity.Diet;
import com.fitnesstan.fitnesstan_backend.Entity.WorkoutPlan;
import com.fitnesstan.fitnesstan_backend.DTO.ChangePasswordRequest;
import com.fitnesstan.fitnesstan_backend.DTO.FullUserInfoDTO;
import com.fitnesstan.fitnesstan_backend.Services.UserServices;
import com.fitnesstan.fitnesstan_backend.Services.WorkoutPlanServices;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserServices userServices;

    @Autowired
    private UserRepository userRepository;

    // Autowire the PasswordEncoder bean to encode and match passwords.
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private WorkoutPlanServices workoutPlanServices;

    // Endpoint to fetch basic user information by email.
    @GetMapping("/{email}")
    public ResponseEntity<Users> getUserByEmail(@PathVariable String email) {
        Users user = userRepository.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to fetch full user details using the authenticated user's email.
    @GetMapping("/full")
    public ResponseEntity<?> getFullUserInfo(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("[DEBUG] Authenticated user's email: " + email);

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("[DEBUG] No user found for email: " + email);
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        Diet diet = user.getCurrentDiet();
        WorkoutPlan workoutPlan = user.getCurrentWorkoutPlan();

        System.out.println("[DEBUG] Retrieved User: " + user);
        System.out.println("[DEBUG] Retrieved Diet: " + diet);
        System.out.println("[DEBUG] Retrieved WorkoutPlan: " + workoutPlan);

        FullUserInfoDTO fullInfo = new FullUserInfoDTO(user, diet, workoutPlan);
        System.out.println("[DEBUG] FullUserInfoDTO: " + fullInfo);

        return ResponseEntity.ok(fullInfo);
    }

    // Endpoint to update user details.
    @PutMapping
    public ResponseEntity<String> updateUser(@RequestBody Users updatedUser) {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        Users existingUser = userServices.findByUsername(username);

        if (existingUser == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        try {
            if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
                existingUser.setUsername(updatedUser.getUsername());
            }
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(userServices.encodePassword(updatedUser.getPassword()));
            }
            if (updatedUser.getHeightFt() != null) {
                existingUser.setHeightFt(updatedUser.getHeightFt());
            }
            if (updatedUser.getWeightKg() != null) {
                existingUser.setWeightKg(updatedUser.getWeightKg());
            }
            if (updatedUser.getGender() != null && !updatedUser.getGender().isEmpty()) {
                existingUser.setGender(updatedUser.getGender());
            }
            if (updatedUser.getDob() != null) {
                existingUser.setDob(updatedUser.getDob());
            }
            if (updatedUser.getOccupation() != null && !updatedUser.getOccupation().isEmpty()) {
                existingUser.setOccupation(updatedUser.getOccupation());
            }
            if (updatedUser.getReligion() != null && !updatedUser.getReligion().isEmpty()) {
                existingUser.setReligion(updatedUser.getReligion());
            }
            if (updatedUser.getExerciseLevel() != null && !updatedUser.getExerciseLevel().isEmpty()) {
                existingUser.setExerciseLevel(updatedUser.getExerciseLevel());
            }
            if (updatedUser.getSleepHours() != null) {
                existingUser.setSleepHours(updatedUser.getSleepHours());
            }
            if (updatedUser.getMedicalHistory() != null) {
                existingUser.setMedicalHistory(updatedUser.getMedicalHistory());
            }

            userServices.saveUserToDatabase(existingUser);
            return new ResponseEntity<>("User updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update user: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Change password endpoint for the authenticated user.
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest passwordChangeRequest,
            Authentication authentication) {
        try {
            // 1) Get current user email from the authentication object.
            String currentEmail = authentication.getName();
            Users user = userRepository.findByEmail(currentEmail);

            // 2) Check if the user exists.
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found.");
            }

            // 3) Verify if the provided current password matches the one in the database.
            if (!passwordEncoder.matches(passwordChangeRequest.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Current password is incorrect.");
            }

            // 4) Update the user's password with the new password (properly encoded)
            user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
            user.setUpdatedAt(LocalDateTime.now());
            userServices.saveUserToDatabase(user);

            return ResponseEntity.ok("Password changed successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error changing password: " + e.getMessage());
        }
    }

    // Delete the current user endpoint.
    @DeleteMapping
    public ResponseEntity<String> deleteUser() {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        try {
            Users user = userServices.findByUsername(username);
            if (user == null) {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
            userRepository.deleteById(user.getId());
            return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/change-item")
    public ResponseEntity<String> changeItemFromCluster(
            @RequestBody Map<String, Object> payload, // Use Object to accept numbers as well
            Authentication authentication) {

        // 1) Extract the required fields from the JSON payload
        String itemName = (String) payload.get("itemName"); // Extract itemName
        if (itemName == null || itemName.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Missing required field: itemName");
        }

        // 2) Get the current user from Spring Security context
        String email = authentication.getName();
        System.out.println("[DEBUG] Email: " + email);
        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        // 3) Retrieve tdee value from the database for the current user
        Double tdee = user.getTdee(); // Assuming getTdee() returns the tdee value from user's diet
        if (tdee == 0 || tdee <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid tdee value for user.");
        }

        String userId = user.getId().toString();
        System.out.println(
                "[DEBUG] change-item called for userId=" + userId + ", itemName=" + itemName + ", tdee=" + tdee);

        // 4) Delegate to the service method and pass the tdee
        boolean replaced = userServices.changeItemFromCluster(userId, itemName, tdee);

        if (replaced) {
            return ResponseEntity.ok("Item successfully changed from cluster.");
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to change item.");
        }
    }

    @PutMapping("/resubmit-data")
    public ResponseEntity<Users> updateUserFromForm(
            @RequestBody Users updatedUser,
            Authentication authentication) {

        // 1) Load the currently authenticated user
        String email = authentication.getName();
        Users existingUser = userRepository.findByEmail(email);
        if (existingUser == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String userId = existingUser.getId().toString();

        // 2) Delete existing diet & workout plan
        try {
            userServices.deleteUserDietAndRemoveReference(userId);
            userServices.deleteUserWorkoutPlanAndRemoveReference(userId);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // 3) Copy form values onto existingUser
        updateUserDetails(existingUser, updatedUser);
        System.out.println("Updated User : " + existingUser);
        Users reSubmitUser;
        // 4) Recalculate BMI/TDEE/etc.
        try {
            reSubmitUser = userServices.validateAndResubmitUserInfo(existingUser);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // 5) Any post‐update hook
        afterSettingUserData(reSubmitUser);

        // // 6) Persist the updated user
        // userRepository.save(existingUser);

        // ──────────────────────────────────────────────────────────
        // 7) NOW: regenerate both plans before final return
        try {
            String reSubmitUserId = reSubmitUser.getId().toString();
            // a) workout plan
            WorkoutPlan newWorkout = workoutPlanServices.generateWorkoutPlan(reSubmitUserId);
            reSubmitUser.setCurrentWorkoutPlan(newWorkout);

            // b) diet plan via Flask
            Map<String, Object> flaskResponse = userServices.sendUserDataToFlask(reSubmitUser);
            Diet newDiet = userServices.addDietPlanFromFlaskResponse(userId, flaskResponse);
            reSubmitUser.setCurrentDiet(newDiet);

            // c) save the new references
            userRepository.save(reSubmitUser);
        } catch (Exception ex) {
            // You can choose to log and continue, or fail here:
            System.err.println("[ERROR] regenerating plans: " + ex.getMessage());
        }

        // 8) Return the fully updated user
        return ResponseEntity.ok(reSubmitUser);
    }

    // Helper method to update user details
    private void updateUserDetails(Users existingUser, Users updatedUser) {
        if (updatedUser.getHeightFt() != null) {
            existingUser.setHeightFt(updatedUser.getHeightFt());
        }
        if (updatedUser.getWeightKg() != null) {
            existingUser.setWeightKg(updatedUser.getWeightKg());
        }
        if (updatedUser.getGender() != null) {
            existingUser.setGender(updatedUser.getGender());
        }
        if (updatedUser.getDob() != null) {
            existingUser.setDob(updatedUser.getDob());
        }
        if (updatedUser.getOccupation() != null) {
            existingUser.setOccupation(updatedUser.getOccupation());
        }
        if (updatedUser.getReligion() != null) {
            existingUser.setReligion(updatedUser.getReligion());
        }
        if (updatedUser.getExerciseLevel() != null) {
            existingUser.setExerciseLevel(updatedUser.getExerciseLevel());
        }
        if (updatedUser.getSleepHours() != null) {
            existingUser.setSleepHours(updatedUser.getSleepHours());
        }
        if (updatedUser.getMedicalHistory() != null) {
            existingUser.setMedicalHistory(updatedUser.getMedicalHistory());
        }
    }

    // You can implement any additional logic here
    private void afterSettingUserData(Users user) {
        // Example: Logging or sending notifications
        System.out.println("User data updated: " + user.toString());
    }

}
