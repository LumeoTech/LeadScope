package com.crmscanner.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteUserRequest(
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    String email,
    @NotBlank(message = "O nome é obrigatório")
    String name,
    @NotBlank(message = "A role do usuário é obrigatória")
    String role // ADMIN, VENDEDOR, VIEWER
) {}
