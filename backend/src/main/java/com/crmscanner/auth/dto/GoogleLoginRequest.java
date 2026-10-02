package com.crmscanner.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
    @NotBlank(message = "O ID token do Google é obrigatório.")
    String idToken
) {
}
