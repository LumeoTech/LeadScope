package com.crmscanner.scanner.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PlaceSearchRequest(
    @NotNull(message = "Latitude é obrigatória")
    Double latitude,

    @NotNull(message = "Longitude é obrigatória")
    Double longitude,

    Integer radius,

    @NotEmpty(message = "Selecione ao menos um nicho/categoria")
    List<String> categories,

    String captureFilter, // ALL, PHONE_ONLY, PHONE_AND_WEB

    String source
) {}
