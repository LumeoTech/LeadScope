package com.crmscanner.exception;

import java.time.LocalDateTime;

/**
 * Representa o corpo padrão de todas as respostas de erro da API.
 *
 * Em vez de retornar stack traces ou mensagens técnicas, a API sempre
 * retorna este objeto JSON. Isso evita vazamento de informações sensíveis.
 *
 * Exemplo de resposta:
 * {
 *   "timestamp": "2025-01-01T10:00:00",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Lead não encontrado",
 *   "path": "/api/leads/999"
 * }
 */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
    /**
     * Cria um ApiError com o timestamp atual.
     * "record" em Java é uma classe imutável com getters automáticos.
     */
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(LocalDateTime.now(), status, error, message, path);
    }
}
