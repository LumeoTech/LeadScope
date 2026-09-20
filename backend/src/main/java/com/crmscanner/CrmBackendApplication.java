package com.crmscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class CrmBackendApplication {

    public static void main(String[] args) {
        loadDotenv();
        fixSupabaseConfig();
        SpringApplication.run(CrmBackendApplication.class, args);
    }

    private static void fixSupabaseConfig() {
        String host = System.getenv("DB_HOST");
        if (host == null || host.isBlank()) {
            host = System.getProperty("DB_HOST");
        }
        if (host != null && host.startsWith("db.") && host.contains(".supabase.co")) {
            System.setProperty("DB_HOST", "aws-0-us-east-2.pooler.supabase.com");
            String user = System.getenv("DB_USER");
            if (user == null || user.isBlank()) {
                user = System.getProperty("DB_USER");
            }
            if (user != null && !user.contains(".")) {
                int start = 3;
                int end = host.indexOf(".supabase.co");
                String ref = host.substring(start, end);
                System.setProperty("DB_USER", user + "." + ref);
            }
        }

        String dsUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dsUrl == null || dsUrl.isBlank()) {
            dsUrl = System.getProperty("SPRING_DATASOURCE_URL");
        }
        if (dsUrl != null && dsUrl.contains("db.") && dsUrl.contains(".supabase.co")) {
            String fixedUrl = dsUrl.replaceAll("db\\.[a-z0-9]+\\.supabase\\.co", "aws-0-us-east-2.pooler.supabase.com");
            System.setProperty("SPRING_DATASOURCE_URL", fixedUrl);
        }
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
