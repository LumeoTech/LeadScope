package com.crmscanner.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Endpoint de health check — verifica se a API está no ar.
 *
 * Útil para:
 * - Confirmar que o servidor iniciou corretamente
 * - Monitoramento básico em produção
 * - Testar se o banco está conectado (pode ser expandido)
 *
 * GET /api/health → { "status": "UP", "timestamp": "..." }
 */
@RestController
public class HealthController {

    @GetMapping({"/api/health", "/healthz", "/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Lumeo LeadScope API",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
