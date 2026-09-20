package com.crmscanner.distribution.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.distribution.dto.DistributionMemberRequest;
import com.crmscanner.distribution.dto.DistributionMemberResponse;
import com.crmscanner.distribution.dto.DistributionRuleRequest;
import com.crmscanner.distribution.dto.DistributionRuleResponse;
import com.crmscanner.distribution.service.DistributionRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/distribution/rules")
@RequiredArgsConstructor
@Tag(name = "Distribuição — Regras", description = "Gerenciamento de regras de distribuição e filas de vendedores")
@SecurityRequirement(name = "bearerAuth")
public class DistributionRuleController {

    private final DistributionRuleService ruleService;

    @GetMapping
    @Operation(summary = "Listar regras", description = "Retorna todas as regras de distribuição ativas (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<DistributionRuleResponse>> listAll() {
        return ResponseEntity.ok(ruleService.listAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter regra", description = "Detalhes de uma regra de distribuição por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<DistributionRuleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar regra", description = "Cadastra nova regra de distribuição (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DistributionRuleResponse> create(
            @Valid @RequestBody DistributionRuleRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar regra", description = "Atualiza os dados de uma regra de distribuição (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DistributionRuleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DistributionRuleRequest request
    ) {
        return ResponseEntity.ok(ruleService.update(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar status", description = "Ativa ou desativa uma regra de distribuição (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DistributionRuleResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.toggleStatus(id));
    }

    // ——— Membros ———

    @GetMapping("/{id}/members")
    @Operation(summary = "Listar membros da regra", description = "Vendedores participantes desta regra de distribuição")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<DistributionMemberResponse>> listMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.listMembers(id));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Adicionar membro", description = "Adiciona um vendedor à regra de distribuição (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DistributionMemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody DistributionMemberRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @Operation(summary = "Remover membro", description = "Remove um vendedor da regra de distribuição (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        ruleService.removeMember(id, memberId);
        return ResponseEntity.noContent().build();
    }
}
