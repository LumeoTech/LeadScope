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
     * Define a senha do usuário convidado e retorna access + refresh token com a role pré-definida.
     */
    @Transactional
    public AuthResponse acceptInvite(com.crmscanner.auth.dto.AcceptInviteRequest request) {
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("Convite ou usuário não encontrado para o e-mail: " + normalizedEmail));

        user.setPassword(passwordEncoder.encode(request.password()));
        user.setStatus("ACTIVE");
        user.setActive(true);
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
     * Valida o ID Token do Google, sincroniza/cria o usuário e emite o JWT de sessão.
     */
    @Transactional
    public AuthResponse loginWithGoogle(com.crmscanner.auth.dto.GoogleLoginRequest request) {
        String idToken = request.idToken() != null ? request.idToken().trim() : "";
        if (idToken.isBlank()) {
            throw new BusinessException("Token do Google inválido ou não fornecido.");
        }

        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + java.net.URLEncoder.encode(idToken, java.nio.charset.StandardCharsets.UTF_8)))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> response = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new BusinessException("Token do Google inválido ou expirado.");
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode payload = mapper.readTree(response.body());

            String email = payload.path("email").asText(null);
            String emailVerified = payload.path("email_verified").asText("false");
            String name = payload.path("name").asText(null);
            String picture = payload.path("picture").asText(null);
            String aud = payload.path("aud").asText(null);

            if (email == null || email.isBlank()) {
                throw new BusinessException("O token do Google não contém um endereço de e-mail.");
            }

            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw new BusinessException("O e-mail da conta Google informada não está verificado.");
            }

            String configuredClientId = System.getenv("GOOGLE_CLIENT_ID");
            if (configuredClientId != null && !configuredClientId.isBlank()) {
                if (!configuredClientId.equals(aud)) {
                    throw new BusinessException("ID Token emitido para outra aplicação (aud mismatch).");
                }
            }

            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);

            if (user == null) {
                // Cria novo usuário corporativo via Google
                Role role = roleRepository.findByName("ADMIN")
                        .orElseGet(() -> roleRepository.findByName("VENDEDOR")
                                .orElseThrow(() -> new BusinessException("Perfil padrão do sistema não encontrado.")));

                user = new User();
                user.setName(name != null && !name.isBlank() ? name.trim() : normalizedEmail.split("@")[0]);
                user.setEmail(normalizedEmail);
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Senha aleatória forte
                user.setRole(role);
                user.setActive(true);
                user.setStatus("ACTIVE");
                user = userRepository.save(user);
            } else {
                if ("PENDING".equalsIgnoreCase(user.getStatus())) {
                    throw new BusinessException("Seu acesso ainda não foi aprovado pelo administrador.");
                }
                if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
                    throw new BusinessException("Seu acesso foi recusado pelo administrador.");
                }
                if (!user.isEnabled()) {
                    throw new BusinessException("Conta desativada. Entre em contato com o suporte.");
                }
            }

            return buildAuthResponse(user);
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Falha ao validar credenciais do Google: " + e.getMessage());
        }
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
