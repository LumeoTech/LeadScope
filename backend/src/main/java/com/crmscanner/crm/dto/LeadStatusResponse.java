package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.LeadStatus;

import java.time.LocalDateTime;

public record LeadStatusResponse(
    Long id,
    String name,
    String color,
    Integer position,
    Boolean isFinal,
    Boolean isDefault,
    Boolean active,
    LocalDateTime createdAt
) {
    public static LeadStatusResponse fromEntity(LeadStatus s) {
        return new LeadStatusResponse(
            s.getId(),
            s.getName(),
            s.getColor(),
            s.getPosition(),
            s.getIsFinal(),
            s.getIsDefault(),
            s.getActive(),
            s.getCreatedAt()
        );
    }
}
