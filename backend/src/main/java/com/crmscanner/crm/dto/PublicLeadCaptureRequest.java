package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record PublicLeadCaptureRequest(
    @NotBlank(message = "O nome do contato é obrigatório")
    String name,
    String email,
    String phone,
    String companyName,
    String cnpj,
    String message,
    String city,
    String state,
    BigDecimal estimatedValue
) {}
