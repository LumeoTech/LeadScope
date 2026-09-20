package com.crmscanner.distribution.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DistributionMemberRequest(
    @NotNull(message = "O ID do usuário (userId) é obrigatório")
    Long userId,

    @Min(value = 1, message = "O peso mínimo é 1")
    Integer weight,

    Boolean active
) {}
