package com.crmscanner.crm.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.ActivityRequest;
import com.crmscanner.crm.dto.ActivityResponse;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.entity.LeadActivity;
import com.crmscanner.crm.repository.LeadActivityRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LeadActivityService {

    private final LeadActivityRepository activityRepository;
    private final LeadRepository leadRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<ActivityResponse> listByLead(Long leadId) {
        return activityRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(ActivityResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> listUpcoming(User currentUser) {
        return activityRepository.findUpcomingActivities(currentUser.getId(), LocalDateTime.now()).stream()
                .map(ActivityResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ActivityResponse create(ActivityRequest request, User currentUser) {
        Lead lead = leadRepository.findById(request.leadId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead", request.leadId()));

        LeadActivity activity = new LeadActivity();
        activity.setLead(lead);
        activity.setUser(currentUser);
        activity.setType(request.type().toUpperCase());
        activity.setTitle(request.title().trim());
        activity.setDescription(request.description());
        activity.setScheduledAt(request.scheduledAt());

        LeadActivity saved = activityRepository.save(activity);

        auditService.log(
                "LEAD_ACTIVITY",
                saved.getId(),
                "CREATE",
                null,
                Map.of("type", saved.getType(), "title", saved.getTitle(), "leadId", lead.getId()),
                "Atividade (" + saved.getType() + ") registrada no lead #" + lead.getId() + ": " + saved.getTitle()
        );

        return ActivityResponse.fromEntity(saved);
    }

    @Transactional
    public ActivityResponse markAsDone(Long activityId) {
        LeadActivity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Atividade", activityId));

        activity.setDoneAt(LocalDateTime.now());
        LeadActivity updated = activityRepository.save(activity);

        auditService.log(
                "LEAD_ACTIVITY",
                updated.getId(),
                "UPDATE",
                Map.of("done", false),
                Map.of("done", true, "doneAt", updated.getDoneAt().toString()),
                "Atividade concluída: " + updated.getTitle()
        );

        return ActivityResponse.fromEntity(updated);
    }

    @Transactional
    public void delete(Long activityId) {
        LeadActivity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Atividade", activityId));
        auditService.log(
                "LEAD_ACTIVITY",
                activity.getId(),
                "DELETE",
                Map.of("title", activity.getTitle()),
                null,
                "Atividade excluída: " + activity.getTitle()
        );
        activityRepository.delete(activity);
    }
}
