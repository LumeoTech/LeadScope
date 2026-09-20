package com.crmscanner.audit.aspect;

import com.crmscanner.audit.annotation.Audited;
import com.crmscanner.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @AfterReturning(pointcut = "@annotation(audited)", returning = "result")
    public void auditMethodExecution(JoinPoint joinPoint, Audited audited, Object result) {
        try {
            Long entityId = extractEntityId(result, joinPoint.getArgs());
            String description = audited.description().isEmpty()
                    ? "Execução automática de " + joinPoint.getSignature().getName()
                    : audited.description();

            auditService.log(
                    audited.entityType(),
                    entityId != null ? entityId : 0L,
                    audited.action(),
                    description
            );
        } catch (Exception e) {
            log.warn("Falha no aspecto de auditoria: {}", e.getMessage());
        }
    }

    private Long extractEntityId(Object result, Object[] args) {
        if (result != null) {
            Long id = tryGetId(result);
            if (id != null) return id;
        }

        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof Long id) {
                    return id;
                }
                Long id = tryGetId(arg);
                if (id != null) return id;
            }
        }
        return null;
    }

    private Long tryGetId(Object obj) {
        if (obj == null) return null;
        try {
            Method getIdMethod = obj.getClass().getMethod("getId");
            Object idVal = getIdMethod.invoke(obj);
            if (idVal instanceof Long l) {
                return l;
            }
        } catch (Exception ignored) {
            // Nem todo objeto possui getId()
        }
        try {
            Method idRecordMethod = obj.getClass().getMethod("id");
            Object idVal = idRecordMethod.invoke(obj);
            if (idVal instanceof Long l) {
                return l;
            }
        } catch (Exception ignored) {
            // Nem todo record possui id()
        }
        return null;
    }
}
