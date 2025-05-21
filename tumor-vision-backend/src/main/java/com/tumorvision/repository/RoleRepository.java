package com.tumorvision.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.tumorvision.model.ERole;
import com.tumorvision.model.Role;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
}