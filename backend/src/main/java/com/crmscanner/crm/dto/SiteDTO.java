package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Site;
import com.crmscanner.crm.entity.SiteEmailTemplate;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public class SiteDTO {

    public record SiteCreateRequest(
        @NotBlank(message = "O nome do site é obrigatório")
        String name,
        String clientName,
        String url,
        String thumbnail,
        java.time.LocalDate deliveryDate,
        String status, // Online, Em desenvolvimento, Em manutenção
        String slug,
        String webhookUrl,
        Boolean active
    ) {}

    public record SiteUpdateRequest(
        String name,
        String clientName,
        String url,
        String thumbnail,
        java.time.LocalDate deliveryDate,
        String status,
        String slug,
        String webhookUrl,
        Boolean active
    ) {}

    public record SiteResponse(
        Long id,
        String name,
        String clientName,
        String url,
        String thumbnail,
        java.time.LocalDate deliveryDate,
        String status,
        String slug,
        String webhookUrl,
        Boolean active,
        int templateCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static SiteResponse fromEntity(Site s) {
            return new SiteResponse(
                s.getId(),
                s.getName(),
                s.getClientName(),
                s.getUrl(),
                s.getThumbnail(),
                s.getDeliveryDate(),
                s.getStatus() != null ? s.getStatus() : "Online",
                s.getSlug(),
                s.getWebhookUrl(),
                s.getActive(),
                s.getTemplates() != null ? s.getTemplates().size() : 0,
                s.getCreatedAt(),
                s.getUpdatedAt()
            );
        }
    }

    public record TemplateRequest(
        @NotBlank(message = "O nome do template é obrigatório")
        String name,
        String triggerEvent,
        @NotBlank(message = "O assunto do e-mail é obrigatório")
        String subject,
        @NotBlank(message = "O corpo HTML do e-mail é obrigatório")
        String bodyHtml,
        Boolean active
    ) {}

    public record TemplateResponse(
        Long id,
        Long siteId,
        String siteName,
        String name,
        String triggerEvent,
        String subject,
        String bodyHtml,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static TemplateResponse fromEntity(SiteEmailTemplate t) {
            return new TemplateResponse(
                t.getId(),
                t.getSite() != null ? t.getSite().getId() : null,
                t.getSite() != null ? t.getSite().getName() : null,
                t.getName(),
                t.getTriggerEvent(),
                t.getSubject(),
                t.getBodyHtml(),
                t.getActive(),
                t.getCreatedAt(),
                t.getUpdatedAt()
            );
        }
    }
}
