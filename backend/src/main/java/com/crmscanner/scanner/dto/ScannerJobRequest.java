package com.crmscanner.scanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ScannerJobRequest(
    @NotBlank(message = "O nome do trabalho (job) é obrigatório")
    @Size(max = 255, message = "O nome pode ter no máximo 255 caracteres")
    String name,

    String source, // BRASIL_API, RECEITA_FEDERAL, MOCK_PROVIDER

    @Size(max = 2, message = "Estado deve ser UF com 2 caracteres")
    String filterState,

    String filterCity,
    String filterCnae,
    String filterPorte,

    Boolean autoImport,
    Boolean autoCreateLead
) {}
