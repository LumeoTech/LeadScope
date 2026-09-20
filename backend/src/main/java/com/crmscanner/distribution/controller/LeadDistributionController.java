package com.crmscanner.distribution.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.distribution.dto.LeadDistributionResponse;
import com.crmscanner.distribution.dto.ManualDistributionRequest;
import com.crmscanner.distribution.service.LeadDistributionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/distribution")
@RequiredArgsConstructor
@Tag(name = "Distribuição — Execução", description = "Disparo e histórico de distribuição de leads para a equipe comercial")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
public class LeadDistributionController {

    private final LeadDistributionService distributionService;

    @PostMapping("/leads/{leadId}/auto")
    @Operation(summary = "Distribuir automaticamente", description = "Executa motor de regras e distribui o lead via Round-Robin/Filtros")
    public ResponseEntity<LeadDistributionResponse> autoDistribute(
            @PathVariable Long leadId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(distributionService.autoDistribute(leadId, currentUser));
    }

    @PostMapping("/leads/{leadId}/manual")
    @Operation(summary = "Distribuir manualmente", description = "Atribui o lead a um vendedor específico registrando no histórico de distribuição")
    public ResponseEntity<LeadDistributionResponse> manualDistribute(
            @PathVariable Long leadId,
            @Valid @RequestBody ManualDistributionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(distributionService.manualDistribute(leadId, request, currentUser));
    }

    @GetMapping("/leads/{leadId}/history")
    @Operation(summary = "Histórico do lead", description = "Retorna o histórico de todas as distribuições e transferências do lead")
    public ResponseEntity<List<LeadDistributionResponse>> getLeadHistory(@PathVariable Long leadId) {
        return ResponseEntity.ok(distributionService.getLeadHistory(leadId));
    }
}
