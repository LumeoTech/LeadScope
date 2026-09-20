package com.crmscanner.distribution.repository;

import com.crmscanner.distribution.entity.LeadDistribution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LeadDistributionRepository extends JpaRepository<LeadDistribution, Long> {

    List<LeadDistribution> findByLeadIdOrderByDistributedAtDesc(Long leadId);

    Page<LeadDistribution> findByAssignedToId(Long userId, Pageable pageable);

    @Query("SELECT ld FROM LeadDistribution ld WHERE ld.rule.id = :ruleId ORDER BY ld.distributedAt DESC LIMIT 1")
    Optional<LeadDistribution> findLastDistributionByRule(@Param("ruleId") Long ruleId);

    @Query("SELECT COUNT(ld) FROM LeadDistribution ld WHERE ld.rule.id = :ruleId AND ld.assignedTo.id = :userId")
    long countByRuleAndUser(@Param("ruleId") Long ruleId, @Param("userId") Long userId);
}
