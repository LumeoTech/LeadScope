package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LeadStatusRequest(
    @NotBlank(message = "O nome do status é obrigatório")
    @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres")
    String name,

    @Size(max = 7, message = "A cor deve ser um código hex válido (ex: #6366F1)")
    String color,

    @NotNull(message = "A posição no funil é obrigatória")
    Integer position,

    Boolean isFinal,
    Boolean isDefault
) {}
