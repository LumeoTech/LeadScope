package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotNull;

public record TransferLeadRequest(
        @NotNull(message = "O usuário de destino é obrigatório")
        Long targetUserId,
        String reason
) {}
