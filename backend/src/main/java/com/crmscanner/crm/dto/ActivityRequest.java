package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record ActivityRequest(
    @NotNull(message = "O ID do lead (leadId) é obrigatório")
    Long leadId,

    @NotBlank(message = "O tipo de atividade é obrigatório (LIGACAO, EMAIL, REUNIAO, WHATSAPP, NOTA, TAREFA)")
    String type,

    @NotBlank(message = "O título da atividade é obrigatório")
    @Size(max = 300, message = "O título pode ter no máximo 300 caracteres")
    String title,

    String description,
    LocalDateTime scheduledAt
) {}
