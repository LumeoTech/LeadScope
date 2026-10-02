package com.crmscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class CrmBackendApplication {

    /** Variáveis obrigatórias — servidor não inicia sem elas. */
    private static final List<String> REQUIRED_ENV_VARS = List.of(
        "DB_PASSWORD",
        "DB_USER",
        "JWT_SECRET"
    );

    public static void main(String[] args) {
        loadDotenv();
        fixSupabaseConfig();
        validateRequiredEnvVars();
        validateJwtSecretStrength();
        SpringApplication.run(CrmBackendApplication.class, args);
    }

    /**
     * Falha imediatamente se alguma variável obrigatória estiver ausente.
     * Isso impede o servidor de subir com segredos padrão inseguros.
     */
    private static void validateRequiredEnvVars() {
        List<String> missing = REQUIRED_ENV_VARS.stream()
            .filter(key -> {
                String fromEnv = System.getenv(key);
                String fromProp = System.getProperty(key);
                return (fromEnv == null || fromEnv.isBlank())
                    && (fromProp == null || fromProp.isBlank());
            })
            .toList();

        if (!missing.isEmpty()) {
            System.err.println("\n");
            System.err.println("========================================================");
            System.err.println("  ERRO FATAL: Variáveis de ambiente obrigatórias não");
            System.err.println("  foram definidas. O servidor não pode inicializar.");
            System.err.println("========================================================");
            missing.forEach(v -> System.err.println("  FALTANDO: " + v));
            System.err.println("--------------------------------------------------------");
            System.err.println("  Solução: defina essas variáveis no arquivo .env ou");
            System.err.println("  nas variáveis de ambiente do servidor (Render/Vercel).");
            System.err.println("  Consulte o arquivo .env.example para referência.");
            System.err.println("========================================================\n");
            System.exit(1);
        }
    }

    /**
     * Valida que o JWT_SECRET tem pelo menos 32 caracteres para ser seguro.
     */
    private static void validateJwtSecretStrength() {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            secret = System.getProperty("JWT_SECRET", "");
        }
        if (secret.length() < 32) {
            System.err.println("\n");
            System.err.println("========================================================");
            System.err.println("  ERRO FATAL: JWT_SECRET é muito curto (< 32 chars).");
            System.err.println("  Use: openssl rand -base64 64");
            System.err.println("========================================================\n");
            System.exit(1);
        }
        // Rejeita valores de placeholder óbvios
        List<String> weakSecrets = List.of(
            "chave-secreta-local",
            "troque-esta-chave",
            "secret",
            "changeme",
            "password"
        );
        final String lowerSecret = secret.toLowerCase();
        if (weakSecrets.stream().anyMatch(lowerSecret::contains)) {
            System.err.println("\n");
            System.err.println("========================================================");
            System.err.println("  ERRO FATAL: JWT_SECRET contém valor de placeholder.");
            System.err.println("  Gere um segredo forte: openssl rand -base64 64");
            System.err.println("========================================================\n");
            System.exit(1);
        }
    }

    private static void fixSupabaseConfig() {
        String host = resolveEnvOrProp("DB_HOST");
        if (host != null && host.startsWith("db.") && host.contains(".supabase.co")) {
            System.setProperty("DB_HOST", "aws-0-us-east-2.pooler.supabase.com");
            String user = resolveEnvOrProp("DB_USER");
            if (user != null && !user.contains(".")) {
                int end = host.indexOf(".supabase.co");
                String ref = host.substring(3, end);
                System.setProperty("DB_USER", user + "." + ref);
            }
        }

        String currentHost = resolveEnvOrProp("DB_HOST");
        if (currentHost != null && currentHost.contains("pooler.supabase.com")) {
            String dbPort = resolveEnvOrProp("DB_PORT");
            if (dbPort == null || dbPort.isBlank() || "5432".equals(dbPort)) {
                System.setProperty("DB_PORT", "6543");
            }
            String dbParams = System.getProperty("DB_PARAMS");
            if (dbParams == null || !dbParams.contains("prepareThreshold=0")) {
                System.setProperty("DB_PARAMS", "?sslmode=require&prepareThreshold=0");
            }
        }

        String dsUrl = resolveEnvOrProp("SPRING_DATASOURCE_URL");
        if (dsUrl != null) {
            String fixedUrl = dsUrl.replaceAll("db\\.[a-z0-9]+\\.supabase\\.co", "aws-0-us-east-2.pooler.supabase.com");
            if (fixedUrl.contains("pooler.supabase.com:5432")) {
                fixedUrl = fixedUrl.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
            }
            if (fixedUrl.contains("pooler.supabase.com") && !fixedUrl.contains("prepareThreshold=0")) {
                fixedUrl += (fixedUrl.contains("?") ? "&" : "?") + "prepareThreshold=0";
            }
            System.setProperty("SPRING_DATASOURCE_URL", fixedUrl);
        }
    }

    private static String resolveEnvOrProp(String key) {
        String val = System.getenv(key);
        if (val == null || val.isBlank()) {
            val = System.getProperty(key);
        }
        return (val == null || val.isBlank()) ? null : val;
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
                        // Nunca sobrescreve variáveis já definidas no ambiente do sistema
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                    System.out.println("[Lumeo] Variáveis carregadas de: " + f.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("[Lumeo] Erro ao ler .env: " + e.getMessage());
                }
            }
        }
    }
}
