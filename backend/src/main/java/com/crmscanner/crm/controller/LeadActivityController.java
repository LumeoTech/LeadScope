package com.crmscanner.crm.controller;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.ActivityRequest;
import com.crmscanner.crm.dto.ActivityResponse;
import com.crmscanner.crm.service.LeadActivityService;
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
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Tag(name = "Atividades e Reuniões", description = "Agendamento de reuniões, tarefas, ligações e timeline de interações dos leads")
@SecurityRequirement(name = "bearerAuth")
public class LeadActivityController {

    private final LeadActivityService activityService;

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Timeline do lead", description = "Lista todas as interações, reuniões e histórico do lead")
    public ResponseEntity<List<ActivityResponse>> getByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(activityService.listByLead(leadId));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Agenda / Reuniões futuras", description = "Retorna reuniões e tarefas agendadas pendentes do usuário logado")
    public ResponseEntity<List<ActivityResponse>> getUpcoming(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(activityService.listUpcoming(currentUser));
    }

    @PostMapping
    @Operation(summary = "Registrar atividade / Agendar reunião", description = "Cria uma nova atividade (REUNIAO, LIGACAO, EMAIL, WHATSAPP, NOTA, TAREFA)")
    public ResponseEntity<ActivityResponse> create(
            @Valid @RequestBody ActivityRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.create(request, currentUser));
    }

    @PatchMapping("/{id}/done")
    @Operation(summary = "Concluir atividade", description = "Marca uma reunião ou tarefa como realizada")
    public ResponseEntity<ActivityResponse> markAsDone(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.markAsDone(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir atividade", description = "Remove um compromisso ou atividade do sistema")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
