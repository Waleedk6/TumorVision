package com.tumorvision.Entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class Users {

    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id; // MongoDB ObjectId for user

    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private List<String> roles; // e.g., "admin", "doctor", "patient"

    private String status; // e.g., "PENDING", "ACTIVE"

    private String verificationToken;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
