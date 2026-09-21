package com.crmscanner.crm.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.*;
import com.crmscanner.crm.service.DailyAutoLeadScannerService;
import com.crmscanner.crm.service.LeadService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/leads", "/leads"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Leads (Oportunidades)", description = "Gerenciamento de oportunidades de venda e kanban comercial")
@SecurityRequirement(name = "bearerAuth")
public class LeadController {

    private final LeadService leadService;
    private final DailyAutoLeadScannerService dailyAutoLeadScannerService;

    // =========================================================================
    // 1. ROTAS ESTÁTICAS E AUTÔNOMAS (DECLARADAS PRIMEIRO PARA EVITAR CONFLITO COM /{id})
    // =========================================================================

    @GetMapping
    @Operation(summary = "Listar leads", description = "Busca paginada com filtros (vendedores visualizam apenas suas próprias oportunidades)")
    public ResponseEntity<Page<LeadResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Long assignedToId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.searchLeads(search, statusId, priority, companyId, assignedToId, pageable, currentUser));
    }

    @PostMapping
    @Operation(summary = "Criar lead", description = "Cadastra nova oportunidade de venda vinculada a uma empresa")
    public ResponseEntity<LeadResponse> create(
            @Valid @RequestBody LeadCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.create(request, currentUser));
    }

    @PostMapping("/batch-delete")
    @Operation(summary = "Excluir leads em lote", description = "Remove múltiplos leads selecionados")
    public ResponseEntity<Void> batchDelete(@Valid @RequestBody LeadBatchDeleteRequest request) {
        leadService.deleteBatch(request.ids());
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = {"/auto-scan-daily", "/auto-scan/daily"}, method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Busca diária de leads", description = "Executa a rotina de prospecção autônoma respeitando filtros de score e localização")
    public ResponseEntity<List<LeadResponse>> autoScanDaily(@AuthenticationPrincipal User currentUser) {
        int target = dailyAutoLeadScannerService.getSettings().getLeadsPerDay();
        return ResponseEntity.ok(dailyAutoLeadScannerService.scanAndGenerateDailyLeads(target, currentUser));
    }

    @GetMapping({"/auto-scan-status", "/auto-scan/status"})
    @Operation(summary = "Status da busca diária", description = "Retorna o status atual da rotina de busca de leads")
    public ResponseEntity<DailyAutoLeadScannerService.DailyScanStatus> getDailyScanStatus() {
        return ResponseEntity.ok(dailyAutoLeadScannerService.getDailyScanStatus());
    }

    @GetMapping({"/auto-scan-settings", "/auto-scan/settings"})
    @Operation(summary = "Obter configurações da busca", description = "Retorna horário, cota diária, score mínimo e filtro de região")
    public ResponseEntity<com.crmscanner.crm.entity.AutoScanSettings> getAutoScanSettings() {
        return ResponseEntity.ok(dailyAutoLeadScannerService.getSettings());
    }

    @RequestMapping(value = {"/auto-scan-settings", "/auto-scan/settings"}, method = {RequestMethod.POST, RequestMethod.PUT})
    @Operation(summary = "Salvar configurações da busca", description = "Persiste horário, cota diária, score mínimo e filtro de região no Supabase")
    public ResponseEntity<com.crmscanner.crm.entity.AutoScanSettings> updateAutoScanSettings(
            @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(dailyAutoLeadScannerService.updateSettings(body));
    }

    @GetMapping({"/auto-scan-analytics", "/auto-scan/analytics"})
    @Operation(summary = "Métricas de qualidade e analytics da busca", description = "Retorna distribuição de score, taxa de aceite e rankings regionais")
    public ResponseEntity<DailyAutoLeadScannerService.AutoScanAnalytics> getAutoScanAnalytics() {
        return ResponseEntity.ok(dailyAutoLeadScannerService.getAnalytics());
    }

    @RequestMapping(value = {"/agent/run", "/agent"}, method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Executar Agente de Qualificação", description = "Dispara manualmente a rotina autônoma de qualificação e scoring de leads")
    public ResponseEntity<Map<String, Object>> runAgent() {
        int count = leadService.runAutonomousLeadQualificationAgent();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "processed", count,
                "message", "Agente executado com sucesso! " + count + " leads qualificados com AI score, chance de aceite e potencial de mercado."
        ));
    }

    // =========================================================================
    // 2. ROTAS COM ID NUMÉRICO (EXPRESSÃO REGULAR {id:\\d+} PARA EVITAR FALSO MATCH)
    // =========================================================================

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Obter lead", description = "Detalhes de uma oportunidade por ID")
    public ResponseEntity<LeadResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.findById(id, currentUser));
    }

    @PutMapping("/{id:\\d+}")
    @Operation(summary = "Atualizar lead", description = "Atualiza informações gerais da oportunidade")
    public ResponseEntity<LeadResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LeadUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.update(id, request, currentUser));
    }

    @PatchMapping("/{id:\\d+}/status")
    @Operation(summary = "Mover status (Kanban)", description = "Altera a etapa do lead no funil com registro de auditoria")
    public ResponseEntity<LeadResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeadStatusChangeRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.changeStatus(id, request, currentUser));
    }

    @PatchMapping("/{id:\\d+}/assign/{vendorId:\\d+}")
    @Operation(summary = "Atribuir vendedor", description = "Atribui a oportunidade a um vendedor responsável (Admin ou Responsável atual)")
    public ResponseEntity<LeadResponse> assign(
            @PathVariable Long id,
            @PathVariable Long vendorId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.assignLead(id, vendorId, currentUser));
    }

    @PostMapping("/{id:\\d+}/transfer")
    @Operation(summary = "Transferir lead para outro usuário", description = "Transfere a titularidade do lead para outro usuário do CRM")
    public ResponseEntity<LeadResponse> transfer(
            @PathVariable Long id,
            @Valid @RequestBody TransferLeadRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.transferLead(id, request, currentUser));
    }

    @PostMapping("/{id:\\d+}/send")
    @Operation(summary = "Enviar lead para usuário", description = "Atribui e notifica o usuário destinatário sobre o novo lead")
    public ResponseEntity<LeadResponse> send(
            @PathVariable Long id,
            @Valid @RequestBody SendLeadRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.sendLead(id, request, currentUser));
    }

    @DeleteMapping("/{id:\\d+}")
    @Operation(summary = "Excluir lead", description = "Remove oportunidade do sistema")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leadService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id:\\d+}/notes")
    @Operation(summary = "Listar anotações do lead", description = "Histórico cronológico de notas e conversas")
    public ResponseEntity<List<LeadNoteResponse>> listNotes(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.listNotes(id));
    }

    @PostMapping("/{id:\\d+}/notes")
    @Operation(summary = "Adicionar anotação", description = "Salva nova anotação/conversa no histórico do lead")
    public ResponseEntity<LeadNoteResponse> addNote(
            @PathVariable Long id,
            @Valid @RequestBody LeadNoteCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.addNote(id, request.content(), currentUser));
    }

    @RequestMapping(value = {"/{id:\\d+}/enrich-website", "/{id:\\d+}/enrich"}, method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Enriquecer dados do site do lead", description = "Extrai metadados, título, email e telefone direto do website oficial ou busca na web")
    public ResponseEntity<LeadResponse> enrichWebsite(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String url = body != null ? body.get("website") : null;
        return ResponseEntity.ok(leadService.enrichLeadWebsite(id, url));
    }
}
