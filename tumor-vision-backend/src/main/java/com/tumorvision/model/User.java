package com.tumorvision.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    private String password;
    private String fullName;
    private String medicalLicense;
    
    @DBRef
    private Role role;

    // Constructors
    public User() {}

    public User(String email, String password, String fullName, String medicalLicense) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.medicalLicense = medicalLicense;
    }

    // Getters and Setters (generate these in VS Code with Right-click → Source Action → Generate Getters and Setters)
    public String getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    // ... generate all others

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMedicalLicense() {
        return medicalLicense;
    }

    public void setMedicalLicense(String medicalLicense) {
        this.medicalLicense = medicalLicense;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}