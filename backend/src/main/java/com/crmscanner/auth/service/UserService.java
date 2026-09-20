package com.crmscanner.auth.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.dto.CreateUserRequest;
import com.crmscanner.auth.dto.UpdateUserRequest;
import com.crmscanner.auth.dto.UserResponse;
import com.crmscanner.auth.entity.Role;
import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.RoleRepository;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import com.crmscanner.auth.repository.RefreshTokenRepository;
import com.crmscanner.crm.repository.LeadRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Boolean active, Pageable pageable) {
        if (active != null) {
            return userRepository.findByActive(active, pageable).map(UserResponse::fromEntity);
        }
        return userRepository.findAll(pageable).map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.fromEntity(getUserEntity(id));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findVendors() {
        return userRepository.findByRoleNameAndActiveTrue("VENDEDOR").stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Já existe um usuário cadastrado com o email: " + request.email());
        }

        Role role = roleRepository.findByName(request.role().toUpperCase())
                .orElseThrow(() -> new BusinessException("Perfil inválido: " + request.role()));

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setActive(true);

        User saved = userRepository.save(user);

        auditService.log(
                "USER",
                saved.getId(),
                "CREATE",
                null,
                Map.of("name", saved.getName(), "email", saved.getEmail(), "role", role.getName()),
                "Usuário criado no sistema: " + saved.getEmail()
        );

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getUserEntity(id);

        Map<String, Object> oldValue = Map.of(
                "name", user.getName(),
                "role", user.getRole().getName(),
                "active", user.getActive()
        );

        user.setName(request.name());

        if (request.role() != null && !request.role().isBlank()) {
            Role role = roleRepository.findByName(request.role().toUpperCase())
                    .orElseThrow(() -> new BusinessException("Perfil inválido: " + request.role()));
            user.setRole(role);
        }

        if (request.active() != null) {
            user.setActive(request.active());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        User updated = userRepository.save(user);

        Map<String, Object> newValue = Map.of(
                "name", updated.getName(),
                "role", updated.getRole().getName(),
                "active", updated.getActive()
        );

        auditService.log(
                "USER",
                updated.getId(),
                "UPDATE",
                oldValue,
                newValue,
                "Dados do usuário atualizados: " + updated.getEmail()
        );

        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse toggleStatus(Long id) {
        User user = getUserEntity(id);
        boolean newStatus = !Boolean.TRUE.equals(user.getActive());
        user.setActive(newStatus);
        User updated = userRepository.save(user);

        auditService.log(
                "USER",
                updated.getId(),
                "STATUS_CHANGE",
                Map.of("active", !newStatus),
                Map.of("active", newStatus),
                "Status do usuário alterado para " + (newStatus ? "ATIVO" : "INATIVO")
        );

        return UserResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findPendingUsers() {
        return userRepository.findByStatus("PENDING").stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countPendingUsers() {
        return userRepository.countByStatus("PENDING");
    }

    @Transactional
    public UserResponse approveUser(Long id) {
        User user = getUserEntity(id);
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new BusinessException("Perfil ADMIN não encontrado."));

        user.setStatus("ACTIVE");
        user.setActive(true);
        user.setRole(adminRole);
        User updated = userRepository.save(user);

        auditService.log(
                "USER",
                updated.getId(),
                "APPROVE",
                Map.of("status", "PENDING"),
                Map.of("status", "ACTIVE", "role", "ADMIN"),
                "Usuário aprovado como Administrador: " + updated.getEmail()
        );

        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse rejectUser(Long id) {
        User user = getUserEntity(id);
        user.setStatus("REJECTED");
        user.setActive(false);
        User updated = userRepository.save(user);

        auditService.log(
                "USER",
                updated.getId(),
                "REJECT",
                Map.of("status", "PENDING"),
                Map.of("status", "REJECTED"),
                "Solicitação de usuário recusada: " + updated.getEmail()
        );

        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteUser(Long id, User currentUser) {
        User user = getUserEntity(id);

        if (currentUser != null && user.getId().equals(currentUser.getId())) {
            throw new BusinessException("Você não pode excluir o seu próprio usuário de administrador.");
        }

        // Revoga e remove tokens de autenticação
        refreshTokenRepository.deleteByUser(user);

        // Se o usuário possuir leads atribuídos, reatribui para o admin
        if (currentUser != null) {
            leadRepository.reassignAll(user.getId(), currentUser);
        }

        // Tenta exclusão física; se houver vínculo histórico imutável (ex: auditoria), desativa o registro
        try {
            userRepository.delete(user);
        } catch (Exception e) {
            user.setActive(false);
            user.setStatus("DELETED");
            userRepository.save(user);
        }

        auditService.log(
                "USER",
                id,
                "DELETE",
                Map.of("email", user.getEmail(), "name", user.getName()),
                null,
                "Usuário excluído do sistema: " + user.getEmail()
        );
    }

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }
}
