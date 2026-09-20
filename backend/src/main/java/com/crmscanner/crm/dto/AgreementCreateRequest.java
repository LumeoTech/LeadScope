package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record AgreementCreateRequest(
    Long clientId,
    Long companyId,
    Long leadId,
    String clientName,
    String clientEmail,
    @NotBlank(message = "Conteúdo do termo é obrigatório")
    String termContent
) {}
