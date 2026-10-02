package com.crmscanner.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Filtro de Rate Limiting para o endpoint de login (/api/auth/login).
 * Limita tentativas consecutivas de força-bruta por IP (Máx 5 tentativas por minuto).
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long WINDOW_DURATION_MS = 60_000L; // 1 minuto

    private static class RequestCounter {
        final long windowStart;
        final AtomicInteger count;

        RequestCounter(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("POST".equalsIgnoreCase(request.getMethod()) && request.getRequestURI().endsWith("/api/auth/login")) {
            String clientIp = extractClientIp(request);
            long now = System.currentTimeMillis();

            // Limpa entradas expiradas periodicamente
            if (requestCounts.size() > 500) {
                requestCounts.entrySet().removeIf(entry -> (now - entry.getValue().windowStart) > WINDOW_DURATION_MS);
            }

            RequestCounter counter = requestCounts.compute(clientIp, (ip, current) -> {
                if (current == null || (now - current.windowStart) > WINDOW_DURATION_MS) {
                    return new RequestCounter(now);
                } else {
                    current.count.incrementAndGet();
                    return current;
                }
            });

            if (counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
                long retryAfterSec = Math.max(1, (WINDOW_DURATION_MS - (now - counter.windowStart)) / 1000);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.setHeader("Retry-After", String.valueOf(retryAfterSec));
                response.getWriter().write(String.format(
                        "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Muitas tentativas de login consecutivas. Aguarde %d segundos.\",\"retryAfter\":%d}",
                        retryAfterSec, retryAfterSec
                ));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
