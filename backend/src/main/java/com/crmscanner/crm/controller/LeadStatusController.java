package com.crmscanner.crm.controller;

import com.crmscanner.crm.dto.LeadStatusRequest;
import com.crmscanner.crm.dto.LeadStatusResponse;
import com.crmscanner.crm.service.LeadStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lead-statuses")
@RequiredArgsConstructor
@Tag(name = "Funil de Vendas", description = "Gerenciamento das etapas e status do funil de vendas")
@SecurityRequirement(name = "bearerAuth")
public class LeadStatusController {

    private final LeadStatusService leadStatusService;

    @GetMapping
    @Operation(summary = "Listar status", description = "Retorna todas as etapas ativas do funil ordenadas por posição")
    public ResponseEntity<List<LeadStatusResponse>> listAll() {
        return ResponseEntity.ok(leadStatusService.listAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter status", description = "Detalhes de uma etapa do funil por ID")
    public ResponseEntity<LeadStatusResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leadStatusService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar etapa", description = "Cria nova etapa no funil de vendas (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<LeadStatusResponse> create(@Valid @RequestBody LeadStatusRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadStatusService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar etapa", description = "Atualiza nome, cor ou posição da etapa (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<LeadStatusResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LeadStatusRequest request
    ) {
        return ResponseEntity.ok(leadStatusService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar etapa", description = "Desativa etapa do funil se não houver leads vinculados (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leadStatusService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
