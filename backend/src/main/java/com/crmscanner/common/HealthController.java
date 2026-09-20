package com.crmscanner.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoint de health check — verifica se a API está no ar e testa a conexão com o banco.
 */
@RestController
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping({ "/api/health", "/healthz", "/health" })
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("status", "UP");
        map.put("service", "Lumeo LeadScope API");
        map.put("version", "1.0.1");
        map.put("timestamp", LocalDateTime.now().toString());

        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                map.put("database", "CONNECTED: " + conn.getMetaData().getURL());
            } catch (Exception e) {
                map.put("database", "DISCONNECTED: " + e.getMessage());
            }
        }
        return ResponseEntity.ok(map);
    }
}
