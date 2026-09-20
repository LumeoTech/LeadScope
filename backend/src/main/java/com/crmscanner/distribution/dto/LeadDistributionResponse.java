package com.crmscanner.distribution.dto;

import com.crmscanner.distribution.entity.LeadDistribution;

import java.time.LocalDateTime;

public record LeadDistributionResponse(
    Long id,
    Long leadId,
    String leadTitle,
    Long ruleId,
    String ruleName,
    Long assignedToId,
    String assignedToName,
    Long assignedById,
    String assignedByName,
    String notes,
    LocalDateTime distributedAt
) {
    public static LeadDistributionResponse fromEntity(LeadDistribution ld) {
        return new LeadDistributionResponse(
            ld.getId(),
            ld.getLead().getId(),
            ld.getLead().getTitle(),
            ld.getRule() != null ? ld.getRule().getId() : null,
            ld.getRule() != null ? ld.getRule().getName() : null,
            ld.getAssignedTo().getId(),
            ld.getAssignedTo().getName(),
            ld.getAssignedBy() != null ? ld.getAssignedBy().getId() : null,
            ld.getAssignedBy() != null ? ld.getAssignedBy().getName() : "Automático",
            ld.getNotes(),
            ld.getDistributedAt()
        );
    }
}
