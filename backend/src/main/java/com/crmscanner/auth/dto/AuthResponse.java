package com.crmscanner.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    Long expiresIn,   // segundos até expirar o access token
    UserInfo user
) {
    public record UserInfo(Long id, String name, String email, String role) {}

    public static AuthResponse of(String access, String refresh, long expiresIn, UserInfo user) {
        return new AuthResponse(access, refresh, "Bearer", expiresIn, user);
    }
}
