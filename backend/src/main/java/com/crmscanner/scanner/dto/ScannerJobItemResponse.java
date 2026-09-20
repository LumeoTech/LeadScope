package com.crmscanner.scanner.dto;

import com.crmscanner.scanner.entity.ScannerJobItem;

import java.time.LocalDateTime;
import java.util.Map;

public record ScannerJobItemResponse(
    Long id,
    Long jobId,
    String cnpj,
    String razaoSocial,
    String status,
    Long companyId,
    String errorMessage,
    LocalDateTime processedAt,
    Map<String, Object> rawData
) {
    public static ScannerJobItemResponse fromEntity(ScannerJobItem item) {
        return new ScannerJobItemResponse(
            item.getId(),
            item.getJob().getId(),
            item.getCnpj(),
            item.getRazaoSocial(),
            item.getStatus(),
            item.getCompany() != null ? item.getCompany().getId() : null,
            item.getErrorMessage(),
            item.getProcessedAt(),
            item.getRawData()
        );
    }
}
