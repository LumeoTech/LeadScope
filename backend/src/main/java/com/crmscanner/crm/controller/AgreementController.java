package com.crmscanner.crm.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.AgreementAcceptRequest;
import com.crmscanner.crm.dto.AgreementCreateRequest;
import com.crmscanner.crm.dto.AgreementResponse;
import com.crmscanner.crm.service.AgreementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/agreements", "/agreements"})
@RequiredArgsConstructor
@Tag(name = "Acordos Comerciais", description = "Geração, envio e aceite digital de acordos e termos comerciais")
public class AgreementController {

    private final AgreementService agreementService;

    @PostMapping
    @Operation(summary = "Gerar acordo comercial", description = "Gera um novo termo de acordo comercial com token único para aceite")
    public ResponseEntity<AgreementResponse> create(
            @Valid @RequestBody AgreementCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agreementService.createAgreement(request, currentUser));
    }

    @GetMapping("/{token}")
    @Operation(summary = "Visualizar acordo por token", description = "Endpoint público para o cliente ler o termo antes de aceitar")
    public ResponseEntity<AgreementResponse> getByToken(@PathVariable String token) {
        return ResponseEntity.ok(agreementService.getByToken(token));
    }

    @PostMapping("/{token}/accept")
    @Operation(summary = "Confirmar aceite digital", description = "Endpoint público para confirmação formal do termo pelo cliente")
    public ResponseEntity<AgreementResponse> accept(
            @PathVariable String token,
            @Valid @RequestBody AgreementAcceptRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = servletRequest.getRemoteAddr();
        } else {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        String userAgent = servletRequest.getHeader("User-Agent");
        if (userAgent == null) userAgent = "Desconhecido";

        return ResponseEntity.ok(agreementService.acceptAgreement(token, request, ipAddress, userAgent));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Histórico de acordos do cliente", description = "Lista todos os termos gerados para uma empresa/cliente")
    public ResponseEntity<List<AgreementResponse>> listByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(agreementService.listByClient(clientId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Histórico de acordos do lead", description = "Lista todos os termos gerados para um lead")
    public ResponseEntity<List<AgreementResponse>> listByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(agreementService.listByLead(leadId));
    }
}
