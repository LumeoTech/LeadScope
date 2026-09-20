package com.crmscanner.distribution.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.distribution.dto.LeadDistributionResponse;
import com.crmscanner.distribution.dto.ManualDistributionRequest;
import com.crmscanner.distribution.entity.DistributionRule;
import com.crmscanner.distribution.entity.DistributionRuleMember;
import com.crmscanner.distribution.entity.LeadDistribution;
import com.crmscanner.distribution.repository.DistributionRuleMemberRepository;
import com.crmscanner.distribution.repository.DistributionRuleRepository;
import com.crmscanner.distribution.repository.LeadDistributionRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadDistributionService {

    private final LeadRepository leadRepository;
    private final DistributionRuleRepository ruleRepository;
    private final DistributionRuleMemberRepository memberRepository;
    private final LeadDistributionRepository leadDistributionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public LeadDistributionResponse autoDistribute(Long leadId, User distributedBy) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", leadId));

        Company company = lead.getCompany();
        String state = company != null ? company.getEstado() : null;
        String segment = company != null ? company.getSegmento() : null;

        List<DistributionRule> candidateRules = ruleRepository.findMatchingRules(state, segment);

        if (candidateRules.isEmpty()) {
            throw new BusinessException("Nenhuma regra de distribuição ativa encontrada para o lead #" + leadId);
        }

        for (DistributionRule rule : candidateRules) {
            List<DistributionRuleMember> activeMembers = memberRepository.findByRuleIdAndActiveTrue(rule.getId());
            if (activeMembers.isEmpty()) {
                continue;
            }

            // Ordena membros por id para garantir consistência circular
            activeMembers.sort(Comparator.comparing(DistributionRuleMember::getId));

            User selectedVendor = selectNextVendor(rule, activeMembers);

            lead.setAssignedTo(selectedVendor);
            leadRepository.save(lead);

            LeadDistribution dist = new LeadDistribution();
            dist.setLead(lead);
            dist.setRule(rule);
            dist.setAssignedTo(selectedVendor);
            dist.setAssignedBy(distributedBy);
            dist.setNotes("Distribuição automática pela regra '" + rule.getName() + "' (Estratégia: " + rule.getStrategy() + ")");

            LeadDistribution savedDist = leadDistributionRepository.save(dist);

            auditService.log(
                    "LEAD",
                    lead.getId(),
                    "ASSIGN",
                    null,
                    Map.of("assignedTo", selectedVendor.getName(), "rule", rule.getName()),
                    "Lead #" + lead.getId() + " distribuído automaticamente para " + selectedVendor.getName()
            );

            return LeadDistributionResponse.fromEntity(savedDist);
        }

        throw new BusinessException("Nenhuma regra de distribuição possui vendedores ativos cadastrados.");
    }

    @Transactional
    public LeadDistributionResponse manualDistribute(Long leadId, ManualDistributionRequest request, User distributedBy) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", leadId));

        User vendor = userRepository.findById(request.vendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor", request.vendorId()));

        if (!Boolean.TRUE.equals(vendor.getActive())) {
            throw new BusinessException("O vendedor selecionado está inativo.");
        }

        DistributionRule rule = null;
        if (request.ruleId() != null) {
            rule = ruleRepository.findById(request.ruleId()).orElse(null);
        }

        lead.setAssignedTo(vendor);
        leadRepository.save(lead);

        LeadDistribution dist = new LeadDistribution();
        dist.setLead(lead);
        dist.setRule(rule);
        dist.setAssignedTo(vendor);
        dist.setAssignedBy(distributedBy);
        dist.setNotes(request.notes() != null ? request.notes() : "Distribuição manual");

        LeadDistribution savedDist = leadDistributionRepository.save(dist);

        auditService.log(
                "LEAD",
                lead.getId(),
                "ASSIGN",
                null,
                Map.of("assignedTo", vendor.getName()),
                "Lead #" + lead.getId() + " distribuído manualmente para " + vendor.getName()
        );

        return LeadDistributionResponse.fromEntity(savedDist);
    }

    @Transactional(readOnly = true)
    public List<LeadDistributionResponse> getLeadHistory(Long leadId) {
        return leadDistributionRepository.findByLeadIdOrderByDistributedAtDesc(leadId).stream()
                .map(LeadDistributionResponse::fromEntity)
                .toList();
    }

    private User selectNextVendor(DistributionRule rule, List<DistributionRuleMember> members) {
        if (members.size() == 1) {
            return members.getFirst().getUser();
        }

        // Busca a última distribuição dessa regra para fazer o Round-Robin circular
        Optional<LeadDistribution> lastDist = leadDistributionRepository.findLastDistributionByRule(rule.getId());

        if (lastDist.isEmpty()) {
            return members.getFirst().getUser();
        }

        Long lastUserId = lastDist.get().getAssignedTo().getId();
        int lastIndex = -1;
        for (int i = 0; i < members.size(); i++) {
            if (members.get(i).getUser().getId().equals(lastUserId)) {
                lastIndex = i;
                break;
            }
        }

        int nextIndex = (lastIndex + 1) % members.size();
        return members.get(nextIndex).getUser();
    }
}
