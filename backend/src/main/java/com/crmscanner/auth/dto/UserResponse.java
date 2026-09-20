package com.crmscanner.auth.dto;

import com.crmscanner.auth.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    Boolean active,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().getName() : null,
            user.getActive(),
            user.getStatus() != null ? user.getStatus() : "ACTIVE",
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
