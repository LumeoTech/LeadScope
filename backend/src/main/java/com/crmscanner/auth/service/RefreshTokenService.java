package com.crmscanner.auth.service;

import com.crmscanner.auth.entity.RefreshToken;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.RefreshTokenRepository;
import com.crmscanner.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    /**
     * Cria e persiste um novo refresh token para o usuário.
     * Revoga todos os tokens anteriores (single session por padrão).
     */
    @Transactional
    public RefreshToken create(User user) {
        // Revoga tokens anteriores do usuário
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString());
        rt.setUser(user);
        rt.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000));
        rt.setRevoked(false);

        return refreshTokenRepository.save(rt);
    }

    /**
     * Busca e valida um refresh token. Lança exceção se inválido/expirado.
     */
    @Transactional
    public RefreshToken validateAndGet(String token) {
        RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Refresh token inválido ou não encontrado."));

        if (!rt.isValid()) {
            throw new BusinessException("Refresh token expirado ou revogado. Faça login novamente.");
        }

        return rt;
    }

    /**
     * Revoga todos os refresh tokens do usuário (usado no logout).
     */
    @Transactional
    public void revokeAll(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    /**
     * Limpeza periódica de tokens expirados/revogados.
     */
    @Transactional
    public int cleanup() {
        return refreshTokenRepository.deleteExpiredAndRevoked();
    }
}
