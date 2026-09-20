package com.crmscanner.auth.service;

import com.crmscanner.auth.entity.Role;
import com.crmscanner.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        String secret = "chave-secreta-para-testes-unitarios-minimo-256-bits-crm-scanner-test-2025";
        long expirationMs = 900000; // 15 min
        jwtService = new JwtService(secret, expirationMs);

        Role role = new Role();
        role.setId(1L);
        role.setName("ADMIN");

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Administrador Teste");
        testUser.setEmail("admin@teste.com");
        testUser.setRole(role);
        testUser.setActive(true);
    }

    @Test
    @DisplayName("Deve gerar access token válido com subject e claims corretas")
    void shouldGenerateValidAccessToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("admin@teste.com", jwtService.extractEmail(token));
        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    @DisplayName("Deve invalidar token se usuário for diferente")
    void shouldInvalidateTokenIfDifferentUser() {
        String token = jwtService.generateAccessToken(testUser);

        User anotherUser = new User();
        anotherUser.setEmail("outro@teste.com");

        assertFalse(jwtService.isTokenValid(token, anotherUser));
    }
}
