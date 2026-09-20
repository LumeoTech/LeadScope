package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Lead;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeadResponse(
    Long id,
    String code,
    Long companyId,
    String companyRazaoSocial,
    String companyNomeFantasia,
    String companyCnpj,
    String companySegmento,
    String companyTelefone,
    String companyEmail,
    String companyWebsite,
    String companyCidade,
    String companyEstado,
    Long statusId,
    String statusName,
    String statusColor,
    Long assignedToId,
    String assignedToName,
    String ownerName,
    String title,
    String description,
    BigDecimal value,
    LocalDate expectedClose,
    String priority,
    String source,
    Long siteId,
    String siteName,
    BigDecimal acceptanceChance,
    String costOfLiving,
    String locationPotential,
    String scoreRationale,
    Integer score,
    String websiteContentSummary,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static LeadResponse fromEntity(Lead l) {
        String owner = l.getAssignedTo() != null ? l.getAssignedTo().getName()
                     : (l.getCreatedBy() != null ? l.getCreatedBy().getName() : "Não atribuído");

        String codeVal = l.getCode() != null ? l.getCode() : ("LEAD-2026-" + String.format("%04d", l.getId() != null ? l.getId() : 1));

        return new LeadResponse(
            l.getId(),
            codeVal,
            l.getCompany() != null ? l.getCompany().getId() : null,
            l.getCompany() != null ? l.getCompany().getRazaoSocial() : null,
            l.getCompany() != null ? l.getCompany().getNomeFantasia() : null,
            l.getCompany() != null ? l.getCompany().getCnpj() : null,
            l.getCompany() != null ? l.getCompany().getSegmento() : null,
            l.getCompany() != null ? l.getCompany().getTelefone() : null,
            l.getCompany() != null ? l.getCompany().getEmail() : null,
            l.getCompany() != null ? l.getCompany().getWebsite() : null,
            l.getCompany() != null ? l.getCompany().getCidade() : null,
            l.getCompany() != null ? l.getCompany().getEstado() : null,
            l.getStatus() != null ? l.getStatus().getId() : null,
            l.getStatus() != null ? l.getStatus().getName() : null,
            l.getStatus() != null ? l.getStatus().getColor() : null,
            l.getAssignedTo() != null ? l.getAssignedTo().getId() : null,
            l.getAssignedTo() != null ? l.getAssignedTo().getName() : null,
            owner,
            l.getTitle(),
            l.getDescription(),
            l.getValue(),
            l.getExpectedClose(),
            l.getPriority(),
            l.getSource(),
            l.getSite() != null ? l.getSite().getId() : null,
            l.getSite() != null ? l.getSite().getName() : null,
            l.getAcceptanceChance(),
            l.getCostOfLiving(),
            l.getLocationPotential(),
            l.getScoreRationale(),
            l.getScore(),
            l.getWebsiteContentSummary(),
            l.getCreatedBy() != null ? l.getCreatedBy().getId() : null,
            l.getCreatedBy() != null ? l.getCreatedBy().getName() : null,
            l.getCreatedAt(),
            l.getUpdatedAt()
        );
    }
}
