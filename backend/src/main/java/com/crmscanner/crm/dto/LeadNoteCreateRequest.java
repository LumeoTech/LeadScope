package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record LeadNoteCreateRequest(
    @NotBlank(message = "Conteúdo da anotação é obrigatório")
    String content
) {}
