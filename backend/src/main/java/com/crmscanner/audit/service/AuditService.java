package com.crmscanner.audit.service;

import com.crmscanner.audit.dto.AuditLogResponse;
import com.crmscanner.audit.entity.AuditLog;
import com.crmscanner.audit.repository.AuditLogRepository;
import com.crmscanner.auth.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @SuppressWarnings("unchecked")
    public void log(
            String entityType,
            Long entityId,
            String action,
            Long performedBy,
            Map<String, ?> oldValue,
            Map<String, ?> newValue,
            String description
    ) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setOldValue((Map<String, Object>) oldValue);
            auditLog.setNewValue((Map<String, Object>) newValue);
            auditLog.setDescription(description);

            if (performedBy != null) {
                auditLog.setPerformedBy(performedBy);
            } else {
                auditLog.setPerformedBy(getCurrentUserId());
            }

            HttpServletRequest request = getCurrentHttpRequest();
            if (request != null) {
                auditLog.setIpAddress(getClientIp(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Erro ao registrar log de auditoria: {}", e.getMessage(), e);
        }
    }

    public void log(
            String entityType,
            Long entityId,
            String action,
            Map<String, ?> oldValue,
            Map<String, ?> newValue,
            String description
    ) {
        log(entityType, entityId, action, null, oldValue, newValue, description);
    }

    public void log(String entityType, Long entityId, String action, String description) {
        log(entityType, entityId, action, null, null, null, description);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> findAll(Pageable pageable) {
        return auditLogRepository.findAll(pageable).map(AuditLogResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable)
                .map(AuditLogResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> findByEntityType(String entityType, Pageable pageable) {
        return auditLogRepository.findByEntityType(entityType, pageable).map(AuditLogResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> findByPerformedBy(Long userId, Pageable pageable) {
        return auditLogRepository.findByPerformedBy(userId, pageable).map(AuditLogResponse::fromEntity);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return null;
    }

    private HttpServletRequest getCurrentHttpRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
