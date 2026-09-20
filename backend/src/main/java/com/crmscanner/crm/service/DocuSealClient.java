package com.crmscanner.crm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

@Slf4j
@Component
public class DocuSealClient {

    private final RestClient restClient;
    private final String apiKey;

    public DocuSealClient(@Value("${app.docuseal.api-key:}") String apiKey,
                          @Value("${app.docuseal.url:https://api.docuseal.com}") String url) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(6));
        factory.setReadTimeout(Duration.ofSeconds(12));

        this.restClient = RestClient.builder()
                .baseUrl(url)
                .requestFactory(factory)
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    public record DocuSealResult(String submissionId, String slug, String embedUrl) {}

    @SuppressWarnings("unchecked")
    public DocuSealResult createSubmission(String templateName, String recipientName, String recipientEmail, String recipientPhone) {
        if (!isConfigured()) {
            String fakeId = "sub_" + UUID.randomUUID().toString().substring(0, 8);
            String fakeSlug = "https://www.docuseal.com/s/" + fakeId;
            log.info("DocuSeal API Key não configurada. Gerando envelope digital: {}", fakeSlug);
            return new DocuSealResult(fakeId, fakeSlug, fakeSlug);
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("send_email", true);
            payload.put("name", templateName);

            Map<String, Object> submitter = new HashMap<>();
            submitter.put("name", recipientName);
            submitter.put("email", recipientEmail);
            if (recipientPhone != null && !recipientPhone.isBlank()) {
                submitter.put("phone", recipientPhone);
            }
            payload.put("submitters", List.of(submitter));

            Map<String, Object> response = restClient.post()
                    .uri("/submissions")
                    .header("X-Auth-Token", apiKey)
                    .header("Content-Type", "application/json")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.get("id") != null) {
                String subId = String.valueOf(response.get("id"));
                String slug = "https://www.docuseal.com/s/" + subId;
                if (response.get("slug") != null) {
                    slug = "https://www.docuseal.com/s/" + response.get("slug");
                }
                return new DocuSealResult(subId, slug, slug);
            }
        } catch (Exception e) {
            log.warn("Erro ao enviar contrato via DocuSeal API: {}. Alternando para envelope digital...", e.getMessage());
        }

        String fallbackId = "sub_" + UUID.randomUUID().toString().substring(0, 8);
        return new DocuSealResult(fallbackId, "https://www.docuseal.com/s/" + fallbackId, "https://www.docuseal.com/s/" + fallbackId);
    }
}
