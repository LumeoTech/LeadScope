package com.crmscanner.crm.dto;

import java.time.LocalDateTime;

public record ContractResponse(
    Long id,
    Long companyId,
    Long leadId,
    String companyName,
    String templateName,
    String recipientName,
    String recipientEmail,
    String recipientPhone,
    String status,
    String documentUrl,
    String docusealSubmissionId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
