package com.crmscanner.distribution.repository;

import com.crmscanner.distribution.entity.DistributionRuleMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DistributionRuleMemberRepository extends JpaRepository<DistributionRuleMember, Long> {

    List<DistributionRuleMember> findByRuleIdAndActiveTrue(Long ruleId);

    Optional<DistributionRuleMember> findByRuleIdAndUserId(Long ruleId, Long userId);

    boolean existsByRuleIdAndUserId(Long ruleId, Long userId);
}
