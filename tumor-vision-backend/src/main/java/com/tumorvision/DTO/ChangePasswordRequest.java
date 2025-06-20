package com.fitnesstan.fitnesstan_backend.DTO;

public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    // Default Constructor
    public ChangePasswordRequest() {
    }

    // Getters and Setters
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
