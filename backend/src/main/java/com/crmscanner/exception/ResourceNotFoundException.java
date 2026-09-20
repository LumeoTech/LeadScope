package com.crmscanner.exception;

/**
 * Exceção lançada quando um recurso não é encontrado no banco.
 * Resulta em uma resposta HTTP 404.
 *
 * Por que criar exceção própria?
 * Permite que o GlobalExceptionHandler trate de forma específica,
 * retornando 404 com mensagem clara, em vez de um erro genérico 500.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " não encontrado com id: " + id);
    }
}
