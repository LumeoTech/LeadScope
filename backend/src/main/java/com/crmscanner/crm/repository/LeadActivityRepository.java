package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.LeadActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LeadActivityRepository extends JpaRepository<LeadActivity, Long> {

    List<LeadActivity> findByLeadIdOrderByCreatedAtDesc(Long leadId);

    List<LeadActivity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("""
        SELECT a FROM LeadActivity a
        JOIN FETCH a.lead l
        WHERE a.user.id = :userId
          AND a.doneAt IS NULL
          AND a.scheduledAt >= :fromTime
        ORDER BY a.scheduledAt ASC
    """)
    List<LeadActivity> findUpcomingActivities(
            @Param("userId") Long userId,
            @Param("fromTime") LocalDateTime fromTime
    );
}
