package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotNull;

public record LeadStatusChangeRequest(
    @NotNull(message = "O novo status (statusId) é obrigatório")
    Long statusId,

    String notes
) {}
