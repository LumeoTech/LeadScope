package com.crmscanner.crm.controller;

import com.crmscanner.crm.dto.LeadResponse;
import com.crmscanner.crm.dto.PublicLeadCaptureRequest;
import com.crmscanner.crm.dto.SiteDTO.*;
import com.crmscanner.crm.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites e Templates", description = "Gerenciamento de sites, landing pages e templates de e-mail por site")
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    @Operation(summary = "Listar sites cadastrados")
    public ResponseEntity<List<SiteResponse>> listAll() {
        return ResponseEntity.ok(siteService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter site por ID")
    public ResponseEntity<SiteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar novo site", description = "Apenas administradores podem cadastrar novos sites")
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody SiteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar site")
    public ResponseEntity<SiteResponse> update(@PathVariable Long id, @Valid @RequestBody SiteUpdateRequest request) {
        return ResponseEntity.ok(siteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir site")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== TEMPLATES ====================

    @GetMapping("/all-templates")
    @Operation(summary = "Listar todos os templates de e-mail de todos os sites")
    public ResponseEntity<List<TemplateResponse>> listAllTemplates() {
        return ResponseEntity.ok(siteService.listAllTemplates());
    }

    @GetMapping("/{id}/templates")
    @Operation(summary = "Listar templates de e-mail do site")
    public ResponseEntity<List<TemplateResponse>> listTemplates(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.listTemplates(id));
    }

    @PostMapping("/{id}/templates")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar template de e-mail para o site")
    public ResponseEntity<TemplateResponse> createTemplate(
            @PathVariable Long id,
            @Valid @RequestBody TemplateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.createTemplate(id, request));
    }

    @PutMapping("/{id}/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar template de e-mail")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable Long id,
            @PathVariable Long templateId,
            @Valid @RequestBody TemplateRequest request
    ) {
        return ResponseEntity.ok(siteService.updateTemplate(id, templateId, request));
    }

    @DeleteMapping("/{id}/templates/{templateId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir template de e-mail")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id, @PathVariable Long templateId) {
        siteService.deleteTemplate(id, templateId);
        return ResponseEntity.noContent().build();
    }

    // ==================== CAPTURA PÚBLICA DE LEADS VIA SITE ====================

    @PostMapping("/capture/{slug}")
    @Operation(summary = "Capturar lead via site e disparar e-mail automático", description = "Endpoint público para formulários e webhooks de sites")
    public ResponseEntity<LeadResponse> captureLead(
            @PathVariable String slug,
            @Valid @RequestBody PublicLeadCaptureRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.captureLeadFromSite(slug, request));
    }
}
