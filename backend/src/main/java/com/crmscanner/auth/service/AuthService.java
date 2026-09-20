package com.crmscanner.auth.service;

import com.crmscanner.auth.dto.AuthResponse;
import com.crmscanner.auth.dto.LoginRequest;
import com.crmscanner.auth.entity.RefreshToken;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.crmscanner.auth.dto.RegisterRequest;
import com.crmscanner.auth.entity.Role;
import com.crmscanner.auth.repository.RoleRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    /**
     * Cadastra um novo usuário com perfil VENDEDOR e retorna tokens de autenticação.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.confirmPassword() != null && !request.confirmPassword().isBlank()) {
            if (!request.password().equals(request.confirmPassword())) {
                throw new BusinessException("As senhas não coincidem.");
            }
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Este e-mail já está em uso.");
        }

        Role role = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.findByName("VENDEDOR")
                        .orElseThrow(() -> new BusinessException("Perfil não encontrado no sistema.")));

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setActive(true);
        user.setStatus("PENDING");

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    /**
     * Autentica o usuário e retorna access + refresh token.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user != null && "PENDING".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessException("Seu acesso ainda não foi aprovado.");
        }
        if (user != null && "REJECTED".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessException("Seu acesso foi recusado pelo administrador.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));
        } catch (AuthenticationException e) {
            throw new BusinessException("Credenciais inválidas.");
        }

        if (user == null) {
            user = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado."));
        }

        if (!user.isEnabled()) {
            throw new BusinessException("Conta desativada. Entre em contato com o administrador.");
        }

        return buildAuthResponse(user);
    }

    /**
     * Renova o access token a partir de um refresh token válido.
     */
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken rt = refreshTokenService.validateAndGet(refreshToken);
        User user = rt.getUser();

        // Revoga o token atual e cria um novo (rotation)
        rt.setRevoked(true);

        return buildAuthResponse(user);
    }

    /**
     * Revoga todos os refresh tokens do usuário (logout).
     */
    @Transactional
    public void logout(User user) {
        refreshTokenService.revokeAll(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getName());

        return AuthResponse.of(
                accessToken,
                refreshToken.getToken(),
                jwtService.getAccessTokenExpirationSeconds(),
                userInfo);
    }
}
