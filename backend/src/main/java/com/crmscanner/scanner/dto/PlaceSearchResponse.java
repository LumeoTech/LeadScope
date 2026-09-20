package com.crmscanner.scanner.dto;

import java.util.List;

public record PlaceSearchResponse(
    List<PlaceLeadResponse> leads,
    int totalFound,
    int discardedCount
) {}
