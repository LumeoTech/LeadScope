package com.crmscanner.auth.controller;

import com.crmscanner.auth.dto.CreateUserRequest;
import com.crmscanner.auth.dto.UpdateUserRequest;
import com.crmscanner.auth.dto.UserResponse;
import com.crmscanner.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gerenciamento de usuários e perfis de acesso")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar usuários", description = "Retorna lista paginada de usuários (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Page<UserResponse>> listAll(
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.findAll(active, pageable));
    }

    @GetMapping("/vendors")
    @Operation(summary = "Listar vendedores", description = "Retorna lista de todos os vendedores ativos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<UserResponse>> listVendors() {
        return ResponseEntity.ok(userService.findVendors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter usuário", description = "Busca usuário por ID (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar usuário", description = "Cadastra novo usuário no sistema (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuário", description = "Atualiza dados e perfil do usuário (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar status", description = "Ativa ou desativa um usuário (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleStatus(id));
    }

    @GetMapping("/pending")
    @Operation(summary = "Listar solicitações pendentes", description = "Retorna lista de usuários aguardando aprovação (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> listPending() {
        return ResponseEntity.ok(userService.findPendingUsers());
    }

    @GetMapping("/pending/count")
    @Operation(summary = "Contar solicitações pendentes", description = "Retorna quantidade de usuários pendentes de aprovação")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countPending() {
        return ResponseEntity.ok(userService.countPendingUsers());
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Aprovar usuário", description = "Aprova a solicitação de acesso tornando o usuário um Admin ativo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Recusar usuário", description = "Recusa a solicitação de acesso de um usuário")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir usuário", description = "Remove o usuário do sistema (Apenas Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @org.springframework.security.core.annotation.AuthenticationPrincipal com.crmscanner.auth.entity.User currentUser) {
        userService.deleteUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/invite")
    @Operation(summary = "Convidar usuário por e-mail", description = "Envia convite para cadastro e define a role (Admin, Vendedor, Viewer)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> invite(@Valid @RequestBody com.crmscanner.auth.dto.InviteUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.inviteUser(request));
    }
}
