package com.crmscanner.scanner.dto;

import com.crmscanner.scanner.entity.ScannerJob;

import java.time.LocalDateTime;

public record ScannerJobResponse(
    Long id,
    String name,
    String status,
    String source,
    String filterState,
    String filterCity,
    String filterCnae,
    String filterPorte,
    Integer totalFound,
    Integer totalImported,
    Integer totalSkipped,
    Long startedById,
    String startedByName,
    LocalDateTime startedAt,
    LocalDateTime finishedAt,
    String errorMessage,
    LocalDateTime createdAt
) {
    public static ScannerJobResponse fromEntity(ScannerJob j) {
        return new ScannerJobResponse(
            j.getId(),
            j.getName(),
            j.getStatus(),
            j.getSource(),
            j.getFilterState(),
            j.getFilterCity(),
            j.getFilterCnae(),
            j.getFilterPorte(),
            j.getTotalFound(),
            j.getTotalImported(),
            j.getTotalSkipped(),
            j.getStartedBy() != null ? j.getStartedBy().getId() : null,
            j.getStartedBy() != null ? j.getStartedBy().getName() : null,
            j.getStartedAt(),
            j.getFinishedAt(),
            j.getErrorMessage(),
            j.getCreatedAt()
        );
    }
}
