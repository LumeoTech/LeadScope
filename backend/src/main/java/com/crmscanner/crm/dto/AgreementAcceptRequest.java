package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record AgreementAcceptRequest(
    @NotBlank(message = "Nome completo é obrigatório")
    String fullName
) {}
