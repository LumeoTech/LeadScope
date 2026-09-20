package com.crmscanner.distribution.repository;

import com.crmscanner.distribution.entity.DistributionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DistributionRuleRepository extends JpaRepository<DistributionRule, Long> {

    List<DistributionRule> findByActiveTrueOrderByPriorityDesc();

    @Query("""
        SELECT r FROM DistributionRule r
        WHERE r.active = true
          AND (CAST(:state AS string) IS NULL OR r.filterState IS NULL OR r.filterState = CAST(:state AS string))
          AND (CAST(:segment AS string) IS NULL OR r.filterSegment IS NULL OR LOWER(r.filterSegment) = LOWER(CAST(:segment AS string)))
        ORDER BY r.priority DESC
    """)
    List<DistributionRule> findMatchingRules(@Param("state") String state, @Param("segment") String segment);
}
