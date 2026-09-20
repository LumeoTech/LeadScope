package com.crmscanner.distribution.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.distribution.dto.DistributionMemberRequest;
import com.crmscanner.distribution.dto.DistributionMemberResponse;
import com.crmscanner.distribution.dto.DistributionRuleRequest;
import com.crmscanner.distribution.dto.DistributionRuleResponse;
import com.crmscanner.distribution.entity.DistributionRule;
import com.crmscanner.distribution.entity.DistributionRuleMember;
import com.crmscanner.distribution.repository.DistributionRuleMemberRepository;
import com.crmscanner.distribution.repository.DistributionRuleRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DistributionRuleService {

    private final DistributionRuleRepository ruleRepository;
    private final DistributionRuleMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<DistributionRuleResponse> listAllActive() {
        return ruleRepository.findByActiveTrueOrderByPriorityDesc().stream()
                .map(DistributionRuleResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DistributionRuleResponse findById(Long id) {
        return DistributionRuleResponse.fromEntity(getRuleEntity(id));
    }

    @Transactional
    public DistributionRuleResponse create(DistributionRuleRequest request, User currentUser) {
        DistributionRule rule = new DistributionRule();
        rule.setName(request.name().trim());
        rule.setStrategy(request.strategy() != null ? request.strategy().toUpperCase() : "ROUND_ROBIN");
        rule.setPriority(request.priority() != null ? request.priority() : 0);
        rule.setFilterState(request.filterState() != null ? request.filterState().toUpperCase() : null);
        rule.setFilterSegment(request.filterSegment());
        rule.setActive(true);
        rule.setCreatedBy(currentUser);

        DistributionRule saved = ruleRepository.save(rule);

        auditService.log(
                "DISTRIBUTION_RULE",
                saved.getId(),
                "CREATE",
                null,
                Map.of("name", saved.getName(), "strategy", saved.getStrategy()),
                "Regra de distribuição criada: " + saved.getName()
        );

        return DistributionRuleResponse.fromEntity(saved);
    }

    @Transactional
    public DistributionRuleResponse update(Long id, DistributionRuleRequest request) {
        DistributionRule rule = getRuleEntity(id);

        rule.setName(request.name().trim());
        if (request.strategy() != null) rule.setStrategy(request.strategy().toUpperCase());
        if (request.priority() != null) rule.setPriority(request.priority());
        rule.setFilterState(request.filterState() != null ? request.filterState().toUpperCase() : null);
        rule.setFilterSegment(request.filterSegment());

        return DistributionRuleResponse.fromEntity(ruleRepository.save(rule));
    }

    @Transactional
    public DistributionRuleResponse toggleStatus(Long id) {
        DistributionRule rule = getRuleEntity(id);
        boolean newStatus = !Boolean.TRUE.equals(rule.getActive());
        rule.setActive(newStatus);
        return DistributionRuleResponse.fromEntity(ruleRepository.save(rule));
    }

    // ——— Membros da Regra ———

    @Transactional(readOnly = true)
    public List<DistributionMemberResponse> listMembers(Long ruleId) {
        getRuleEntity(ruleId);
        return memberRepository.findByRuleIdAndActiveTrue(ruleId).stream()
                .map(DistributionMemberResponse::fromEntity)
                .toList();
    }

    @Transactional
    public DistributionMemberResponse addMember(Long ruleId, DistributionMemberRequest request) {
        DistributionRule rule = getRuleEntity(ruleId);

        if (memberRepository.existsByRuleIdAndUserId(ruleId, request.userId())) {
            throw new BusinessException("Este vendedor já faz parte desta regra de distribuição.");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", request.userId()));

        DistributionRuleMember member = new DistributionRuleMember();
        member.setRule(rule);
        member.setUser(user);
        member.setWeight(request.weight() != null ? request.weight() : 1);
        member.setActive(request.active() != null ? request.active() : true);

        return DistributionMemberResponse.fromEntity(memberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long ruleId, Long memberId) {
        DistributionRuleMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro de regra", memberId));
        if (!member.getRule().getId().equals(ruleId)) {
            throw new BusinessException("Membro não pertence a esta regra.");
        }
        memberRepository.delete(member);
    }

    public DistributionRule getRuleEntity(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regra de Distribuição", id));
    }
}
