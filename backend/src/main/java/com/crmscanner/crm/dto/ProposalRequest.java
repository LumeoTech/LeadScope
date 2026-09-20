package com.crmscanner.crm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record ProposalRequest(
    @NotNull(message = "O ID do lead (leadId) é obrigatório")
    Long leadId,

    @NotBlank(message = "O título da proposta é obrigatório")
    @Size(max = 300, message = "O título pode ter no máximo 300 caracteres")
    String title,

    @NotNull(message = "O valor da proposta é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor da proposta deve ser maior que zero")
    BigDecimal value,

    LocalDate validUntil,
    Map<String, Object> items,
    String notes
) {}
