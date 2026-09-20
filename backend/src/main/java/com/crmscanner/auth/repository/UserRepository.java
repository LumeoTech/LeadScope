package com.crmscanner.auth.repository;

import com.crmscanner.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<User> findByRoleNameAndActiveTrue(String roleName);
    java.util.List<User> findByActiveTrue();
    java.util.List<User> findByStatus(String status);
    long countByStatus(String status);
    org.springframework.data.domain.Page<User> findByActive(Boolean active, org.springframework.data.domain.Pageable pageable);
}
