package com.crmscanner.scanner.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.scanner.dto.CnpjLookupResponse;
import com.crmscanner.scanner.dto.ScannerJobItemResponse;
import com.crmscanner.scanner.dto.ScannerJobRequest;
import com.crmscanner.scanner.dto.ScannerJobResponse;
import com.crmscanner.scanner.service.ScannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scanner")
@RequiredArgsConstructor
@Tag(name = "Scanner de Empresas", description = "Varredura comercial de empresas, enriquecimento de dados e importação para o CRM")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
public class ScannerController {

    private final ScannerService scannerService;

    @GetMapping("/lookup/{cnpj}")
    @Operation(summary = "Consulta CNPJ em tempo real", description = "Consulta dados cadastrais de uma empresa pelo CNPJ (Receita/BrasilAPI) e verifica se já existe na base")
    public ResponseEntity<CnpjLookupResponse> lookupCnpj(@PathVariable String cnpj) {
        return ResponseEntity.ok(scannerService.lookupCnpj(cnpj));
    }

    @PostMapping("/places/search")
    @Operation(summary = "Busca estabelecimentos no Google Places", description = "Varredura real de estabelecimentos via Google Places API por coordenadas e categorias")
    public ResponseEntity<com.crmscanner.scanner.dto.PlaceSearchResponse> searchPlaces(
            @Valid @RequestBody com.crmscanner.scanner.dto.PlaceSearchRequest request
    ) {
        return ResponseEntity.ok(scannerService.searchPlaces(request));
    }

    @PostMapping("/jobs")
    @Operation(summary = "Criar e rodar varredura", description = "Executa um novo trabalho de busca de prospects baseado em filtros (UF, cidade, CNAE, porte)")
    public ResponseEntity<ScannerJobResponse> createJob(
            @Valid @RequestBody ScannerJobRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scannerService.createAndRunJob(request, currentUser));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Listar varreduras", description = "Histórico paginado de jobs executados pelo scanner")
    public ResponseEntity<Page<ScannerJobResponse>> listJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(scannerService.listJobs(pageable));
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Detalhes da varredura", description = "Status e estatísticas de um job específico")
    public ResponseEntity<ScannerJobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(scannerService.getJobById(id));
    }

    @GetMapping("/jobs/{id}/items")
    @Operation(summary = "Itens encontrados", description = "Lista paginada de empresas encontradas por uma varredura específica")
    public ResponseEntity<Page<ScannerJobItemResponse>> getJobItems(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(scannerService.getJobItems(id, pageable));
    }

    @PostMapping("/items/{itemId}/import")
    @Operation(summary = "Importar item individual", description = "Converte um prospect encontrado pelo scanner em Empresa cadastrada no CRM")
    public ResponseEntity<ScannerJobItemResponse> importSingleItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "true") boolean createLead,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(scannerService.importSingleItem(itemId, createLead, currentUser));
    }

    @PostMapping("/jobs/{jobId}/import")
    @Operation(summary = "Importar todos do job", description = "Importa todas as empresas pendentes de um job para o CRM, gerando leads automaticamente")
    public ResponseEntity<ScannerJobResponse> importAllJobItems(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "true") boolean createLeads,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(scannerService.importAllPending(jobId, createLeads, currentUser));
    }
}
