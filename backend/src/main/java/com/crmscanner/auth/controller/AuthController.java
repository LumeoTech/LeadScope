package com.crmscanner.auth.controller;

import com.crmscanner.auth.dto.AuthResponse;
import com.crmscanner.auth.dto.LoginRequest;
import com.crmscanner.auth.dto.RefreshRequest;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticação e gerenciamento de tokens JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Cadastro de Vendedor", description = "Cria uma nova conta de vendedor e retorna access + refresh token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody com.crmscanner.auth.dto.RegisterRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica com email/senha e retorna access + refresh token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/accept-invite")
    @Operation(summary = "Aceitar Convite", description = "Define a senha do usuário convidado e realiza o login")
    public ResponseEntity<AuthResponse> acceptInvite(@Valid @RequestBody com.crmscanner.auth.dto.AcceptInviteRequest request) {
        return ResponseEntity.ok(authService.acceptInvite(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token", description = "Renova o access token usando um refresh token válido")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Revoga todos os refresh tokens do usuário autenticado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal User user) {
        authService.logout(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Usuário atual", description = "Retorna os dados do usuário autenticado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthResponse.UserInfo> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new AuthResponse.UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getName()
        ));
    }
}
