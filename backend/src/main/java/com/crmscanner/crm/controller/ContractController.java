package com.crmscanner.crm.controller;

import com.crmscanner.crm.dto.ContractRequest;
import com.crmscanner.crm.dto.ContractResponse;
import com.crmscanner.crm.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Tag(name = "Contratos Digitais", description = "Envio, listagem e assinatura de contratos via DocuSeal")
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/send")
    @Operation(summary = "Enviar Contrato Digital", description = "Gera um envelope digital e envia para assinatura do cliente via DocuSeal")
    public ResponseEntity<ContractResponse> sendContract(@Valid @RequestBody ContractRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.sendContract(request));
    }

    @GetMapping
    @Operation(summary = "Listar todos os contratos", description = "Retorna todos os contratos digitais gerados")
    public ResponseEntity<List<ContractResponse>> listAll() {
        return ResponseEntity.ok(contractService.listAll());
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Listar contratos por empresa", description = "Retorna histórico de contratos de uma empresa")
    public ResponseEntity<List<ContractResponse>> listByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(contractService.listByCompany(companyId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Listar contratos por lead", description = "Retorna histórico de contratos de um lead")
    public ResponseEntity<List<ContractResponse>> listByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(contractService.listByLead(leadId));
    }

    @PostMapping("/{id}/simulate-sign")
    @Operation(summary = "Simular assinatura", description = "Marca o contrato como assinado para validação/testes instantâneos")
    public ResponseEntity<ContractResponse> simulateSign(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.simulateSign(id));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook DocuSeal", description = "Endpoint público para recepção de eventos de assinatura do DocuSeal")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload) {
        contractService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
