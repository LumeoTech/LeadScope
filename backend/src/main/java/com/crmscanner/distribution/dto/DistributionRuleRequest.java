package com.crmscanner.distribution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DistributionRuleRequest(
    @NotBlank(message = "O nome da regra é obrigatório")
    @Size(max = 150, message = "O nome pode ter no máximo 150 caracteres")
    String name,

    String strategy, // ROUND_ROBIN, MANUAL, SEGMENTO, REGIAO
    Integer priority,

    @Size(max = 2, message = "Estado (UF) deve ter 2 caracteres")
    String filterState,

    String filterSegment
) {}
