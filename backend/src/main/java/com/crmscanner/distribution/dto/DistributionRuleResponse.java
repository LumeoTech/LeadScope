package com.crmscanner.distribution.dto;

import com.crmscanner.distribution.entity.DistributionRule;

import java.time.LocalDateTime;

public record DistributionRuleResponse(
    Long id,
    String name,
    String strategy,
    Boolean active,
    Integer priority,
    String filterState,
    String filterSegment,
    Long createdById,
    String createdByName,
    int memberCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static DistributionRuleResponse fromEntity(DistributionRule r) {
        return new DistributionRuleResponse(
            r.getId(),
            r.getName(),
            r.getStrategy(),
            r.getActive(),
            r.getPriority(),
            r.getFilterState(),
            r.getFilterSegment(),
            r.getCreatedBy() != null ? r.getCreatedBy().getId() : null,
            r.getCreatedBy() != null ? r.getCreatedBy().getName() : null,
            r.getMembers() != null ? r.getMembers().size() : 0,
            r.getCreatedAt(),
            r.getUpdatedAt()
        );
    }
}
