package com.crmscanner.audit.dto;

import com.crmscanner.audit.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.Map;

public record AuditLogResponse(
    Long id,
    String entityType,
    Long entityId,
    String action,
    Long performedBy,
    Map<String, Object> oldValue,
    Map<String, Object> newValue,
    String ipAddress,
    String userAgent,
    String description,
    LocalDateTime createdAt
) {
    public static AuditLogResponse fromEntity(AuditLog log) {
        return new AuditLogResponse(
            log.getId(),
            log.getEntityType(),
            log.getEntityId(),
            log.getAction(),
            log.getPerformedBy(),
            log.getOldValue(),
            log.getNewValue(),
            log.getIpAddress(),
            log.getUserAgent(),
            log.getDescription(),
            log.getCreatedAt()
        );
    }
}
