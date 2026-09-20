package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Agreement;

import java.time.LocalDateTime;

public record AgreementResponse(
    Long id,
    Long companyId,
    Long leadId,
    String companyName,
    String clientName,
    String clientEmail,
    String termContent,
    String token,
    String status,
    String acceptedByName,
    LocalDateTime acceptedAt,
    String ipAddress,
    String userAgent,
    String contentSha256,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static AgreementResponse fromEntity(Agreement a) {
        String compName = a.getCompany() != null ? a.getCompany().getRazaoSocial()
                        : (a.getClientName() != null ? a.getClientName() : "Cliente");

        return new AgreementResponse(
            a.getId(),
            a.getCompany() != null ? a.getCompany().getId() : null,
            a.getLead() != null ? a.getLead().getId() : null,
            compName,
            a.getClientName(),
            a.getClientEmail(),
            a.getTermContent(),
            a.getToken(),
            a.getStatus(),
            a.getAcceptedByName(),
            a.getAcceptedAt(),
            a.getIpAddress(),
            a.getUserAgent(),
            a.getContentSha256(),
            a.getCreatedBy() != null ? a.getCreatedBy().getName() : "Sistema",
            a.getCreatedAt(),
            a.getUpdatedAt()
        );
    }
}
