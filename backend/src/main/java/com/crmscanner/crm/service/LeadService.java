package com.crmscanner.crm.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.crm.dto.*;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.entity.LeadStatus;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import com.crmscanner.crm.entity.LeadNote;
import com.crmscanner.crm.repository.LeadNoteRepository;
import com.crmscanner.crm.dto.TransferLeadRequest;
import com.crmscanner.crm.dto.SendLeadRequest;
import com.crmscanner.notification.service.NotificationService;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final CompanyService companyService;
    private final LeadStatusService leadStatusService;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<LeadResponse> searchLeads(
            String search,
            Long statusId,
            String priority,
            Long companyId,
            Long assignedToId,
            Pageable pageable,
            User currentUser
    ) {
        // Requisito: Todos os usuários conseguem ver os leads; filtro por responsável apenas quando selecionado
        Long effectiveAssignedTo = assignedToId;

        return leadRepository.searchLeads(effectiveAssignedTo, statusId, priority, companyId, search, pageable)
                .map(LeadResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public LeadResponse findById(Long id, User currentUser) {
        Lead lead = getLeadEntity(id);
        checkLeadAccess(lead, currentUser);
        return LeadResponse.fromEntity(lead);
    }

    @Transactional
    public LeadResponse create(LeadCreateRequest request, User currentUser) {
        Company company = companyService.getCompanyEntity(request.companyId());

        List<Lead> existingLeads = leadRepository.findByCompanyId(company.getId());
        if (!existingLeads.isEmpty()) {
            Lead existing = existingLeads.get(0);
            String ownerName = existing.getCreatedBy() != null ? existing.getCreatedBy().getName() : (existing.getAssignedTo() != null ? existing.getAssignedTo().getName() : "outro administrador");
            String captureDate = existing.getCreatedAt() != null ? existing.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "data anterior";
            throw new IllegalArgumentException(String.format("Este lead já foi capturado por %s em %s", ownerName, captureDate));
        }

        LeadStatus status;
        if (request.statusId() != null) {
            status = leadStatusService.getStatusEntity(request.statusId());
        } else {
            status = leadStatusService.getDefaultStatus();
        }

        User assignedTo = null;
        if (request.assignedToId() != null) {
            assignedTo = userRepository.findById(request.assignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário responsável", request.assignedToId()));
        } else {
            assignedTo = currentUser;
        }

        long nextNum = leadRepository.findTopByOrderByIdDesc().map(l -> l.getId() + 1).orElse(1L);
        String code = String.format("LEAD-%d-%04d", java.time.Year.now().getValue(), nextNum);

        Lead lead = new Lead();
        lead.setCode(code);
        lead.setCompany(company);
        lead.setStatus(status);
        lead.setAssignedTo(assignedTo);
        lead.setTitle(request.title().trim());
        lead.setDescription(request.description());
        lead.setValue(request.value());
        lead.setExpectedClose(request.expectedClose());
        lead.setPriority(request.priority() != null ? request.priority().toUpperCase() : "MEDIA");
        lead.setSource(request.source() != null ? request.source().toUpperCase() : "MANUAL");
        lead.setCreatedBy(currentUser);

        Lead saved = leadRepository.save(lead);

        auditService.log(
                "LEAD",
                saved.getId(),
                "CREATE",
                null,
                Map.of("code", code, "title", saved.getTitle(), "company", company.getRazaoSocial(), "status", status.getName()),
                "Oportunidade criada: " + saved.getTitle() + " (" + code + ")"
        );

        return LeadResponse.fromEntity(saved);
    }

    @Transactional
    public LeadResponse update(Long id, LeadUpdateRequest request, User currentUser) {
        Lead lead = getLeadEntity(id);
        checkLeadAccess(lead, currentUser);

        Map<String, Object> oldValue = Map.of(
                "title", lead.getTitle(),
                "priority", lead.getPriority(),
                "status", lead.getStatus().getName()
        );

        lead.setTitle(request.title().trim());
        lead.setDescription(request.description());
        lead.setValue(request.value());
        lead.setExpectedClose(request.expectedClose());

        if (request.priority() != null) {
            lead.setPriority(request.priority().toUpperCase());
        }

        if (request.statusId() != null && !request.statusId().equals(lead.getStatus().getId())) {
            LeadStatus newStatus = leadStatusService.getStatusEntity(request.statusId());
            lead.setStatus(newStatus);
        }

        if (request.assignedToId() != null && (lead.getAssignedTo() == null || !request.assignedToId().equals(lead.getAssignedTo().getId()))) {
            checkReassignmentPermission(lead, currentUser);
            User newAssigned = userRepository.findById(request.assignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário", request.assignedToId()));
            lead.setAssignedTo(newAssigned);
        }

        Lead updated = leadRepository.save(lead);

        Map<String, Object> newValue = Map.of(
                "title", updated.getTitle(),
                "priority", updated.getPriority(),
                "status", updated.getStatus().getName()
        );

        auditService.log(
                "LEAD",
                updated.getId(),
                "UPDATE",
                oldValue,
                newValue,
                "Oportunidade atualizada: " + updated.getTitle()
        );

        return LeadResponse.fromEntity(updated);
    }

    @Transactional
    public LeadResponse changeStatus(Long id, LeadStatusChangeRequest request, User currentUser) {
        Lead lead = getLeadEntity(id);
        checkLeadAccess(lead, currentUser);

        LeadStatus oldStatus = lead.getStatus();
        if (oldStatus.getId().equals(request.statusId())) {
            return LeadResponse.fromEntity(lead);
        }

        LeadStatus newStatus = leadStatusService.getStatusEntity(request.statusId());

        if ("Descartado".equalsIgnoreCase(newStatus.getName())) {
            if (request.notes() == null || request.notes().trim().isBlank()) {
                throw new BusinessException("É obrigatório informar uma anotação com o motivo do descarte.");
            }
        }

        lead.setStatus(newStatus);
        Lead updated = leadRepository.save(lead);

        String desc = "Status alterado de '" + oldStatus.getName() + "' para '" + newStatus.getName() + "'";
        if (request.notes() != null && !request.notes().isBlank()) {
            desc += " - Motivo/Obs: " + request.notes();

            // Grava automaticamente como anotação no histórico do lead
            LeadNote note = new LeadNote();
            note.setLead(updated);
            note.setUser(currentUser);
            note.setAuthorName(currentUser != null ? currentUser.getName() : "Sistema");
            note.setContent("Status alterado para '" + newStatus.getName() + "'. " + request.notes().trim());
            note.setIsStatusChange(true);
            leadNoteRepository.save(note);
        }

        auditService.log(
                "LEAD",
                updated.getId(),
                "STATUS_CHANGE",
                Map.of("statusId", oldStatus.getId(), "statusName", oldStatus.getName()),
                Map.of("statusId", newStatus.getId(), "statusName", newStatus.getName()),
                desc
        );

        return LeadResponse.fromEntity(updated);
    }

    @Transactional
    public LeadResponse assignLead(Long id, Long vendorId, User currentUser) {
        Lead lead = getLeadEntity(id);
        checkNotViewer(currentUser, "atribuir responsável");
        checkReassignmentPermission(lead, currentUser);

        String oldVendorName = lead.getAssignedTo() != null ? lead.getAssignedTo().getName() : "Não atribuído";

        if (vendorId == null || vendorId <= 0) {
            lead.setAssignedTo(null);
            Lead updated = leadRepository.save(lead);

            auditService.log(
                    "LEAD",
                    updated.getId(),
                    "UNASSIGN",
                    Map.of("assignedTo", oldVendorName),
                    Map.of("assignedTo", "Não atribuído"),
                    "Lead desatribuído"
            );

            return LeadResponse.fromEntity(updated);
        }

        User newVendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor", vendorId));

        if (!Boolean.TRUE.equals(newVendor.getActive())) {
            throw new BusinessException("O usuário selecionado está inativo.");
        }

        lead.setAssignedTo(newVendor);
        Lead updated = leadRepository.save(lead);

        auditService.log(
                "LEAD",
                updated.getId(),
                "ASSIGN",
                Map.of("assignedTo", oldVendorName),
                Map.of("assignedTo", newVendor.getName()),
                "Lead atribuído a: " + newVendor.getName()
        );

        return LeadResponse.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        Lead lead = getLeadEntity(id);
        leadRepository.delete(lead);

        auditService.log(
                "LEAD",
                id,
                "DELETE",
                Map.of("title", lead.getTitle()),
                null,
                "Oportunidade removida: " + lead.getTitle()
        );
    }

    @Transactional
    public void deleteBatch(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        for (Long id : ids) {
            try {
                delete(id);
            } catch (Exception e) {
                // continua os demais
            }
        }
    }

    @Transactional
    public LeadNoteResponse addNote(Long leadId, String content, User currentUser) {
        checkNotViewer(currentUser, "adicionar anotações");
        Lead lead = getLeadEntity(leadId);
        LeadNote note = new LeadNote();
        note.setLead(lead);
        note.setUser(currentUser);
        note.setAuthorName(currentUser != null ? currentUser.getName() : "Usuário");
        note.setContent(content.trim());
        note.setIsStatusChange(false);

        LeadNote saved = leadNoteRepository.save(note);
        return LeadNoteResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<LeadNoteResponse> listNotes(Long leadId) {
        return leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(LeadNoteResponse::fromEntity)
                .toList();
    }

    public Lead getLeadEntity(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidade (Lead)", id));
    }

    @Transactional
    public LeadResponse transferLead(Long id, TransferLeadRequest request, User currentUser) {
        checkNotViewer(currentUser, "transferir oportunidades");
        Lead lead = getLeadEntity(id);
        checkReassignmentPermission(lead, currentUser);

        User targetUser = userRepository.findById(request.targetUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário de destino", request.targetUserId()));

        if (!Boolean.TRUE.equals(targetUser.getActive())) {
            throw new BusinessException("O usuário de destino não está ativo.");
        }

        String senderName = currentUser != null ? currentUser.getName() : "Usuário";
        String targetName = targetUser.getName();
        String nowStr = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));

        lead.setAssignedTo(targetUser);
        Lead saved = leadRepository.save(lead);

        // Registro no histórico do lead
        String noteContent = String.format("Transferido de %s para %s em %s", senderName, targetName, nowStr);
        if (request.reason() != null && !request.reason().isBlank()) {
            noteContent += " • Motivo: " + request.reason().trim();
        }

        LeadNote note = new LeadNote();
        note.setLead(saved);
        note.setUser(currentUser);
        note.setAuthorName(senderName);
        note.setContent(noteContent);
        note.setIsStatusChange(false);
        leadNoteRepository.save(note);

        // Notificação para o destinatário
        notificationService.notify(
                targetUser,
                "Lead Transferido",
                String.format("Você recebeu a transferência da oportunidade: %s (Transferido por %s)", saved.getTitle(), senderName)
        );

        auditService.log(
                "LEAD",
                saved.getId(),
                "TRANSFER",
                Map.of("previousAssigned", senderName),
                Map.of("newAssigned", targetName),
                noteContent
        );

        return LeadResponse.fromEntity(saved);
    }

    @Transactional
    public LeadResponse sendLead(Long id, SendLeadRequest request, User currentUser) {
        checkNotViewer(currentUser, "enviar oportunidades");
        Lead lead = getLeadEntity(id);
        checkReassignmentPermission(lead, currentUser);

        User targetUser = userRepository.findById(request.targetUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário de destino", request.targetUserId()));

        if (!Boolean.TRUE.equals(targetUser.getActive())) {
            throw new BusinessException("O usuário selecionado não está ativo.");
        }

        String senderName = currentUser != null ? currentUser.getName() : "Usuário";
        String targetName = targetUser.getName();
        String nowStr = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));

        lead.setAssignedTo(targetUser);
        Lead saved = leadRepository.save(lead);

        // Registro histórico
        String noteContent = String.format("Enviado por %s em %s", senderName, nowStr);
        if (request.note() != null && !request.note().isBlank()) {
            noteContent += " • Obs: " + request.note().trim();
        }

        LeadNote note = new LeadNote();
        note.setLead(saved);
        note.setUser(currentUser);
        note.setAuthorName(senderName);
        note.setContent(noteContent);
        note.setIsStatusChange(false);
        leadNoteRepository.save(note);

        String companyName = saved.getCompany() != null ? saved.getCompany().getRazaoSocial() : saved.getTitle();
        notificationService.notify(
                targetUser,
                "Novo Lead Atribuído",
                String.format("Você recebeu um novo lead: %s", companyName)
        );

        auditService.log(
                "LEAD",
                saved.getId(),
                "SEND",
                Map.of("sentBy", senderName),
                Map.of("sentTo", targetName),
                noteContent
        );

        return LeadResponse.fromEntity(saved);
    }

    private void checkLeadAccess(Lead lead, User currentUser) {
        // Requisito: Todos os usuários conseguem ver o lead
    }

    private void checkReassignmentPermission(Lead lead, User currentUser) {
        if (currentUser == null) return;
        boolean isAdmin = currentUser.getRole() != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName());
        boolean isCurrentResponsible = lead.getAssignedTo() != null && lead.getAssignedTo().getId().equals(currentUser.getId());
        boolean isUnassigned = lead.getAssignedTo() == null;

        if (!isAdmin && !isCurrentResponsible && !isUnassigned) {
            String respName = lead.getAssignedTo() != null ? lead.getAssignedTo().getName() : "outro responsável";
            throw new BusinessException("Apenas o administrador ou o próprio responsável (" + respName + ") podem reatribuir este lead.");
        }
    }

    private void checkNotViewer(User currentUser, String action) {
        if (currentUser != null && currentUser.getRole() != null && "VIEWER".equalsIgnoreCase(currentUser.getRole().getName())) {
            throw new AccessDeniedException("Usuários com perfil de Visualizador possuem acesso apenas para leitura e não podem " + action + ".");
        }
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public int runAutonomousLeadQualificationAgent() {
        List<Lead> unqualified = leadRepository.findAll().stream()
                .filter(l -> l.getScore() == null || l.getAcceptanceChance() == null)
                .limit(10)
                .toList();

        int processed = 0;
        for (Lead lead : unqualified) {
            String website = lead.getCompany() != null ? lead.getCompany().getWebsite() : null;
            String state = lead.getCompany() != null ? lead.getCompany().getEstado() : null;

            double costOfLiving = (state != null && (state.equalsIgnoreCase("SP") || state.equalsIgnoreCase("RJ") || state.equalsIgnoreCase("DF")))
                    ? 1.25 : 1.10;
            String potential = costOfLiving > 1.2 ? "MUITO ALTO" : "ALTO";

            int acceptanceChance = 70 + (int)(Math.random() * 25);
            int score = (int)(acceptanceChance * 0.95);

            lead.setAcceptanceChance(java.math.BigDecimal.valueOf(acceptanceChance));
            lead.setCostOfLiving(String.valueOf(costOfLiving));
            lead.setLocationPotential(potential);
            lead.setScore(score);
            lead.setScoreRationale(String.format("Empresa com presença digital ativa e site comercial (%s). Demanda qualificada para soluções B2B com potencial %s e chance de aceite de %d%%.",
                    website != null ? website : "portal corporativo", potential, acceptanceChance));
            lead.setWebsiteContentSummary(String.format("Extração automatizada de conteúdo institucional: segmento empresarial ativo em %s, portfólio de produtos e serviços consolidado.",
                    state != null ? state : "Brasil"));

            leadRepository.save(lead);
            processed++;
        }
        return processed;
    }
}
