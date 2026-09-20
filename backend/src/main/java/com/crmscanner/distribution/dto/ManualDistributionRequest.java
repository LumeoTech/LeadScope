package com.crmscanner.distribution.dto;

import jakarta.validation.constraints.NotNull;

public record ManualDistributionRequest(
    @NotNull(message = "O ID do vendedor (vendorId) é obrigatório")
    Long vendorId,

    Long ruleId,
    String notes
) {}
