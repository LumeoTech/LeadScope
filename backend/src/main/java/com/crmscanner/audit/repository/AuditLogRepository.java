package com.crmscanner.audit.repository;

import com.crmscanner.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByPerformedBy(Long userId, Pageable pageable);

    Page<AuditLog> findByEntityType(String entityType, Pageable pageable);
}
