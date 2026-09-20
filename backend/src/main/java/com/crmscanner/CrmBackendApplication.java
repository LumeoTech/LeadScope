package com.crmscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class CrmBackendApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(CrmBackendApplication.class, args);
    }

    private static void loadDotenv() {
        File[] possibleFiles = new File[] {
            new File(".env"),
            new File("../.env"),
            new File(System.getProperty("user.dir"), ".env"),
            new File(System.getProperty("user.dir"), "../.env")
        };

        for (File f : possibleFiles) {
            if (f.exists() && f.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(f.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int idx = line.indexOf('=');
                        String key = line.substring(0, idx).trim();
                        String val = line.substring(idx + 1).trim();
                        if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        } else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
