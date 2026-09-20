package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record LeadBatchDeleteRequest(
    @NotEmpty(message = "Lista de IDs não pode ser vazia")
    List<Long> ids
) {}
