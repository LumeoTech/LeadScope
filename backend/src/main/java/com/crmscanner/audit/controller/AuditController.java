package com.crmscanner.audit.controller;

import com.crmscanner.audit.dto.AuditLogResponse;
import com.crmscanner.audit.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Auditoria", description = "Consulta do histórico e logs de auditoria de ações")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Listar logs", description = "Lista todos os logs de auditoria paginados")
    public ResponseEntity<Page<AuditLogResponse>> listAll(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long performedBy,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (entityType != null && !entityType.isBlank()) {
            return ResponseEntity.ok(auditService.findByEntityType(entityType, pageable));
        }
        if (performedBy != null) {
            return ResponseEntity.ok(auditService.findByPerformedBy(performedBy, pageable));
        }
        return ResponseEntity.ok(auditService.findAll(pageable));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Logs por entidade", description = "Histórico de auditoria de uma entidade específica")
    public ResponseEntity<Page<AuditLogResponse>> getByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(auditService.findByEntityTypeAndEntityId(entityType, entityId, pageable));
    }
}
