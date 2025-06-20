package com.fitnesstan.fitnesstan_backend.DTO;

import com.fitnesstan.fitnesstan_backend.Entity.Users;
import com.fitnesstan.fitnesstan_backend.Entity.Diet;
import com.fitnesstan.fitnesstan_backend.Entity.WorkoutPlan;

public class FullUserInfoDTO {
    private Users user;
    private Diet diet;
    private WorkoutPlan workoutPlan;

    public FullUserInfoDTO(Users user, Diet diet, WorkoutPlan workoutPlan) {
        // Create a shallow copy of the user without the cyclic fields.
        if (user != null) {
            Users shallowUser = new Users();
            shallowUser.setId(user.getId());
            shallowUser.setUsername(user.getUsername());
            shallowUser.setEmail(user.getEmail());
            shallowUser.setRoles(user.getRoles());
            shallowUser.setStatus(user.getStatus());
            shallowUser.setVerificationToken(user.getVerificationToken());
            shallowUser.setCreatedAt(user.getCreatedAt());
            shallowUser.setUpdatedAt(user.getUpdatedAt());
            shallowUser.setHeightFt(user.getHeightFt());
            shallowUser.setDob(user.getDob());
            shallowUser.setWeightKg(user.getWeightKg());
            shallowUser.setGender(user.getGender());
            shallowUser.setOccupation(user.getOccupation());
            shallowUser.setReligion(user.getReligion());
            shallowUser.setExerciseLevel(user.getExerciseLevel());
            shallowUser.setSleepHours(user.getSleepHours());
            shallowUser.setMedicalHistory(user.getMedicalHistory());
            shallowUser.setBmi(user.getBmi());
            shallowUser.setRee(user.getRee());
            shallowUser.setTdee(user.getTdee());
            // Do NOT include currentDiet or currentWorkoutPlan to avoid cycles.
            this.user = shallowUser;
        } else {
            this.user = null;
        }

        // Create a shallow copy of Diet and remove its back reference.
        if (diet != null) {
            Diet shallowDiet = new Diet();
            shallowDiet.setId(diet.getId());
            shallowDiet.setMealPlan(diet.getMealPlan());
            // Exclude the user reference in Diet.
            this.diet = shallowDiet;
        } else {
            this.diet = null;
        }

        // Create a shallow copy of WorkoutPlan and remove its back reference.
        if (workoutPlan != null) {
            WorkoutPlan shallowPlan = new WorkoutPlan();
            shallowPlan.setId(workoutPlan.getId());
            shallowPlan.setPlanName(workoutPlan.getPlanName());
            shallowPlan.setStartDate(workoutPlan.getStartDate());
            shallowPlan.setEndDate(workoutPlan.getEndDate());
            shallowPlan.setDayPlans(workoutPlan.getDayPlans());
            // Exclude the user reference in WorkoutPlan.
            this.workoutPlan = shallowPlan;
        } else {
            this.workoutPlan = null;
        }
    }

    // Getters and setters
    public Users getUser() {
        return user;
    }
    public void setUser(Users user) {
        this.user = user;
    }
    public Diet getDiet() {
        return diet;
    }
    public void setDiet(Diet diet) {
        this.diet = diet;
    }
    public WorkoutPlan getWorkoutPlan() {
        return workoutPlan;
    }
    public void setWorkoutPlan(WorkoutPlan workoutPlan) {
        this.workoutPlan = workoutPlan;
    }
}
