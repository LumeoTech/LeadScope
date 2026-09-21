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

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@Tag(name = "Leads (Oportunidades)", description = "Gerenciamento de oportunidades de venda e kanban comercial")
@SecurityRequirement(name = "bearerAuth")
public class LeadController {

    private final LeadService leadService;
    private final DailyAutoLeadScannerService dailyAutoLeadScannerService;

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

    @GetMapping("/{id}")
    @Operation(summary = "Obter lead", description = "Detalhes de uma oportunidade por ID")
    public ResponseEntity<LeadResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.findById(id, currentUser));
    }

    @PostMapping
    @Operation(summary = "Criar lead", description = "Cadastra nova oportunidade de venda vinculada a uma empresa")
    public ResponseEntity<LeadResponse> create(
            @Valid @RequestBody LeadCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar lead", description = "Atualiza informações gerais da oportunidade")
    public ResponseEntity<LeadResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LeadUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.update(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mover status (Kanban)", description = "Altera a etapa do lead no funil com registro de auditoria")
    public ResponseEntity<LeadResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeadStatusChangeRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.changeStatus(id, request, currentUser));
    }

    @PatchMapping("/{id}/assign/{vendorId}")
    @Operation(summary = "Atribuir vendedor", description = "Atribui a oportunidade a um vendedor responsável (Admin ou Responsável atual)")
    public ResponseEntity<LeadResponse> assign(
            @PathVariable Long id,
            @PathVariable Long vendorId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.assignLead(id, vendorId, currentUser));
    }

    @PostMapping("/{id}/transfer")
    @Operation(summary = "Transferir lead para outro usuário", description = "Transfere a titularidade do lead para outro usuário do CRM")
    public ResponseEntity<LeadResponse> transfer(
            @PathVariable Long id,
            @Valid @RequestBody TransferLeadRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.transferLead(id, request, currentUser));
    }

    @PostMapping("/{id}/send")
    @Operation(summary = "Enviar lead para usuário", description = "Atribui e notifica o usuário destinatário sobre o novo lead")
    public ResponseEntity<LeadResponse> send(
            @PathVariable Long id,
            @Valid @RequestBody SendLeadRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(leadService.sendLead(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir lead", description = "Remove oportunidade do sistema")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leadService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch-delete")
    @Operation(summary = "Excluir leads em lote", description = "Remove múltiplos leads selecionados")
    public ResponseEntity<Void> batchDelete(@Valid @RequestBody LeadBatchDeleteRequest request) {
        leadService.deleteBatch(request.ids());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/notes")
    @Operation(summary = "Listar anotações do lead", description = "Histórico cronológico de notas e conversas")
    public ResponseEntity<java.util.List<LeadNoteResponse>> listNotes(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.listNotes(id));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Adicionar anotação", description = "Salva nova anotação/conversa no histórico do lead")
    public ResponseEntity<LeadNoteResponse> addNote(
            @PathVariable Long id,
            @Valid @RequestBody LeadNoteCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.addNote(id, request.content(), currentUser));
    }

    @RequestMapping(value = {"/agent/run", "/agent"}, method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Executar Agente de Qualificação", description = "Dispara manualmente a rotina autônoma de qualificação e scoring de leads")
    public ResponseEntity<java.util.Map<String, Object>> runAgent() {
        int count = leadService.runAutonomousLeadQualificationAgent();
        return ResponseEntity.ok(java.util.Map.of(
                "status", "SUCCESS",
                "processed", count,
                "message", "Agente executado com sucesso! " + count + " leads qualificados com AI score, chance de aceite e potencial de mercado."
        ));
    }

    @RequestMapping(value = "/auto-scan-daily", method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Busca diária de 10 leads", description = "Executa a rotina de prospecção autônoma que descobre e insere 10 novos leads qualificados")
    public ResponseEntity<java.util.List<LeadResponse>> autoScanDaily(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dailyAutoLeadScannerService.scanAndGenerateDailyLeads(10, currentUser));
    }

    @GetMapping("/auto-scan-status")
    @Operation(summary = "Status da busca diária", description = "Retorna o status atual da rotina de 10 leads por dia")
    public ResponseEntity<DailyAutoLeadScannerService.DailyScanStatus> getDailyScanStatus() {
        return ResponseEntity.ok(dailyAutoLeadScannerService.getDailyScanStatus());
    }

    @GetMapping("/auto-scan-schedule")
    @Operation(summary = "Obter agendamento da busca diária", description = "Retorna horário configurado para captura de leads")
    public ResponseEntity<DailyAutoLeadScannerService.ScheduleConfig> getAutoScanSchedule() {
        return ResponseEntity.ok(dailyAutoLeadScannerService.getScheduleConfig());
    }

    @RequestMapping(value = "/auto-scan-schedule", method = {RequestMethod.POST, RequestMethod.PUT})
    @Operation(summary = "Configurar horário da busca diária", description = "Atualiza o horário e status da captura automática de leads")
    public ResponseEntity<DailyAutoLeadScannerService.ScheduleConfig> updateAutoScanSchedule(
            @RequestBody java.util.Map<String, Object> body
    ) {
        String time = (String) body.get("time");
        Boolean active = body.get("active") != null ? (Boolean) body.get("active") : null;
        return ResponseEntity.ok(dailyAutoLeadScannerService.updateScheduleConfig(time, active));
    }
}
