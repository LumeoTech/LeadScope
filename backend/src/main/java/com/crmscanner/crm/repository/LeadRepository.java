package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    @Query("""
        SELECT l FROM Lead l
        JOIN FETCH l.company c
        JOIN FETCH l.status s
        LEFT JOIN FETCH l.assignedTo u
        WHERE (:assignedToId IS NULL OR l.assignedTo.id = :assignedToId)
          AND (:statusId IS NULL OR l.status.id = :statusId)
          AND (:priority IS NULL OR l.priority = :priority)
          AND (:companyId IS NULL OR l.company.id = :companyId)
          AND (CAST(:search AS string) IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(l.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(c.razaoSocial) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(c.nomeFantasia) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    """)
    Page<Lead> searchLeads(
            @Param("assignedToId") Long assignedToId,
            @Param("statusId") Long statusId,
            @Param("priority") String priority,
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );

    List<Lead> findByStatusId(Long statusId);

    List<Lead> findByCompanyId(Long companyId);

    long countByStatusId(Long statusId);

    long countBySourceAndCreatedAtAfter(String source, java.time.LocalDateTime createdAt);

    long countByCreatedAtAfter(java.time.LocalDateTime createdAt);

    java.util.Optional<Lead> findTopByOrderByIdDesc();

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Lead l SET l.assignedTo = :newOwner WHERE l.assignedTo.id = :oldOwnerId")
    int reassignAll(@Param("oldOwnerId") Long oldOwnerId, @Param("newOwner") com.crmscanner.auth.entity.User newOwner);
}
