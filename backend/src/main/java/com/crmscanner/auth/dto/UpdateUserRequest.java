package com.crmscanner.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 150, message = "O nome deve ter entre 2 e 150 caracteres")
    String name,

    String role,

    Boolean active,

    @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    String newPassword
) {}
