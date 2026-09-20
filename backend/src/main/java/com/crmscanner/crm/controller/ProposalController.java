package com.crmscanner.crm.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.ProposalRequest;
import com.crmscanner.crm.dto.ProposalResponse;
import com.crmscanner.crm.service.ProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
@Tag(name = "Propostas Comerciais", description = "Elaboração, envio e conversão de propostas comerciais em clientes")
@SecurityRequirement(name = "bearerAuth")
public class ProposalController {

    private final ProposalService proposalService;

    @GetMapping
    @Operation(summary = "Listar todas as propostas", description = "Lista todas as propostas comerciais do sistema")
    public ResponseEntity<List<ProposalResponse>> listAll() {
        return ResponseEntity.ok(proposalService.listAll());
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Propostas do lead", description = "Lista todas as propostas vinculadas a uma oportunidade")
    public ResponseEntity<List<ProposalResponse>> getByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(proposalService.listByLead(leadId));
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Propostas da empresa", description = "Lista todas as propostas vinculadas a uma empresa")
    public ResponseEntity<List<ProposalResponse>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(proposalService.listByCompany(companyId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter proposta", description = "Detalhes da proposta comercial por ID")
    public ResponseEntity<ProposalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Criar proposta", description = "Cadastra uma nova proposta comercial para um lead")
    public ResponseEntity<ProposalResponse> create(
            @Valid @RequestBody ProposalRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proposalService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar proposta", description = "Atualiza valores ou dados de uma proposta em rascunho")
    public ResponseEntity<ProposalResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProposalRequest request
    ) {
        return ResponseEntity.ok(proposalService.update(id, request));
    }

    @PatchMapping("/{id}/send")
    @Operation(summary = "Enviar proposta", description = "Muda o status da proposta para ENVIADA")
    public ResponseEntity<ProposalResponse> send(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.send(id));
    }

    @PatchMapping("/{id}/accept")
    @Operation(summary = "Aceitar proposta (Converter em Cliente)", description = "Aceita proposta, converte a empresa em Cliente e avança o lead para Fechado Ganho")
    public ResponseEntity<ProposalResponse> accept(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.accept(id));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Rejeitar proposta", description = "Marca a proposta como REJEITADA")
    public ResponseEntity<ProposalResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(proposalService.reject(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir proposta", description = "Remove uma proposta comercial do sistema")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        proposalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
