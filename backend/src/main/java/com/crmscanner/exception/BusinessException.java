package com.crmscanner.exception;

/**
 * Exceção lançada quando uma operação viola uma regra de negócio.
 * Resulta em uma resposta HTTP 422 (Unprocessable Entity).
 *
 * Exemplos de uso:
 * - Tentar editar lead de outro responsável
 * - Transição de status inválida
 * - Tentativa de reativar um lead encerrado sem permissão
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
