package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.LeadActivity;

import java.time.LocalDateTime;

public record ActivityResponse(
    Long id,
    Long leadId,
    String leadTitle,
    Long userId,
    String userName,
    String type,
    String title,
    String description,
    LocalDateTime scheduledAt,
    LocalDateTime doneAt,
    LocalDateTime createdAt
) {
    public static ActivityResponse fromEntity(LeadActivity a) {
        return new ActivityResponse(
            a.getId(),
            a.getLead().getId(),
            a.getLead().getTitle(),
            a.getUser().getId(),
            a.getUser().getName(),
            a.getType(),
            a.getTitle(),
            a.getDescription(),
            a.getScheduledAt(),
            a.getDoneAt(),
            a.getCreatedAt()
        );
    }
}
