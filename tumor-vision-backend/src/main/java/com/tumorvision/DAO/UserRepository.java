package com.tumorvision.DAO;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.tumorvision.Entity.Users;

public interface UserRepository extends MongoRepository<Users, ObjectId> {
    
    /** Find a user by their unique username. */
    Users findByUsername(String username);

    /** Find a user by their unique email. */
    Users findByEmail(String email);

    /** Delete a user by their MongoDB ObjectId. */
    @SuppressWarnings("null")
    @Override
    void deleteById(ObjectId id);

    /** Delete a user by their username. */
    void deleteByUsername(String username);

    /** Find a user by their verification token (OTP). */
    Users findByVerificationToken(String token);

    /** Check existence by ObjectId. */
    @SuppressWarnings("null")
    @Override
    boolean existsById(ObjectId id);
}
