package com.crmscanner.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHashTest {

    @Test
    void printHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode("Admin@123");
        System.out.println("GENERATED_BCRYPT_HASH=" + hash);
        org.junit.jupiter.api.Assertions.assertTrue(encoder.matches("Admin@123", hash));
    }
}
