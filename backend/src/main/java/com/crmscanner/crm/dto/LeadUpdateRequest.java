package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LeadUpdateRequest(
    @NotBlank(message = "O título da oportunidade é obrigatório")
    @Size(max = 300, message = "O título pode ter no máximo 300 caracteres")
    String title,

    String description,
    BigDecimal value,
    LocalDate expectedClose,
    String priority,
    Long statusId,
    Long assignedToId
) {}
