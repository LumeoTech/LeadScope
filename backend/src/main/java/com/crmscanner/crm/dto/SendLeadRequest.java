package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotNull;

public record SendLeadRequest(
        @NotNull(message = "O usuário de destino é obrigatório")
        Long targetUserId,
        String note
) {}
