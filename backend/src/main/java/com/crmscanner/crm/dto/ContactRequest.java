package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContactRequest(
    @NotNull(message = "O ID da empresa (companyId) é obrigatório")
    Long companyId,

    Long leadId,

    @NotBlank(message = "O nome do contato é obrigatório")
    @Size(max = 150, message = "O nome pode ter no máximo 150 caracteres")
    String name,

    String role,
    String email,
    String phone,
    String whatsapp,
    String notes
) {}
