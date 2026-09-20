package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LeadCreateRequest(
    @NotNull(message = "A empresa (companyId) é obrigatória")
    Long companyId,

    Long statusId,

    Long assignedToId,

    @NotBlank(message = "O título da oportunidade é obrigatório")
    @Size(max = 300, message = "O título pode ter no máximo 300 caracteres")
    String title,

    String description,
    BigDecimal value,
    LocalDate expectedClose,
    String priority,
    String source
) {}
