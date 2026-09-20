package com.crmscanner.notification.dto;

import com.crmscanner.notification.entity.Notification;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        Boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationResponse fromEntity(Notification entity) {
        return new NotificationResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getIsRead(),
                entity.getCreatedAt()
        );
    }
}
