package com.crmscanner.auth.repository;

import com.crmscanner.auth.entity.RefreshToken;
import com.crmscanner.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    int revokeAllByUser(User user);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.revoked = true OR r.expiresAt < CURRENT_TIMESTAMP")
    int deleteExpiredAndRevoked();

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    int deleteByUser(User user);
}
