package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Proposal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public record ProposalResponse(
    Long id,
    Long leadId,
    String leadTitle,
    Long companyId,
    String companyRazaoSocial,
    String title,
    BigDecimal value,
    String status,
    LocalDate validUntil,
    Map<String, Object> items,
    String notes,
    Long createdById,
    String createdByName,
    LocalDateTime acceptedAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ProposalResponse fromEntity(Proposal p) {
        return new ProposalResponse(
            p.getId(),
            p.getLead().getId(),
            p.getLead().getTitle(),
            p.getCompany().getId(),
            p.getCompany().getRazaoSocial(),
            p.getTitle(),
            p.getValue(),
            p.getStatus(),
            p.getValidUntil(),
            p.getItems(),
            p.getNotes(),
            p.getCreatedBy() != null ? p.getCreatedBy().getId() : null,
            p.getCreatedBy() != null ? p.getCreatedBy().getName() : null,
            p.getAcceptedAt(),
            p.getCreatedAt(),
            p.getUpdatedAt()
        );
    }
}
