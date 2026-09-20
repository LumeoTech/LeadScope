package com.crmscanner.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContractRequest(
    Long companyId,
    Long leadId,
    @NotBlank(message = "Template é obrigatório")
    String templateName,
    @NotBlank(message = "Nome do destinatário é obrigatório")
    String recipientName,
    @NotBlank(message = "E-mail do destinatário é obrigatório")
    @Email(message = "E-mail inválido")
    String recipientEmail,
    String recipientPhone
) {}
