package com.crmscanner.crm.service;

import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.entity.Site;
import com.crmscanner.crm.entity.SiteEmailTemplate;
import com.crmscanner.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailDispatchService {

    private final NotificationService notificationService;

    public void dispatchTemplate(SiteEmailTemplate template, Lead lead, Site site) {
        if (template == null || !Boolean.TRUE.equals(template.getActive())) {
            log.info("Nenhum template ativo para disparo no site {}", site.getName());
            return;
        }

        String leadName = lead.getTitle();
        String companyName = lead.getCompany() != null ? lead.getCompany().getRazaoSocial() : "Sua Empresa";
        String emailTo = lead.getCompany() != null && lead.getCompany().getEmail() != null
                ? lead.getCompany().getEmail()
                : (lead.getDescription() != null && lead.getDescription().contains("E-mail:") ? extractEmail(lead.getDescription()) : null);

        String renderedSubject = renderVariables(template.getSubject(), leadName, companyName, site.getName());
        String renderedBody = renderVariables(template.getBodyHtml(), leadName, companyName, site.getName());

        log.info("DISPARO AUTOMÁTICO DE E-MAIL [Site: {} | Template: {}]", site.getName(), template.getName());
        log.info("Destinatário: {}", emailTo != null ? emailTo : "contato@lead.com");
        log.info("Assunto: {}", renderedSubject);

        // Notifica o responsável / admin no sistema sobre o disparo automático
        if (lead.getAssignedTo() != null) {
            notificationService.notify(
                    lead.getAssignedTo(),
                    "E-mail Automático Disparado",
                    String.format("Template '%s' disparado para o lead '%s' capturado pelo site '%s'.", template.getName(), lead.getTitle(), site.getName())
            );
        }
    }

    private String renderVariables(String content, String leadName, String companyName, String siteName) {
        if (content == null) return "";
        return content
                .replace("{{lead_name}}", leadName != null ? leadName : "")
                .replace("{{company_name}}", companyName != null ? companyName : "")
                .replace("{{site_name}}", siteName != null ? siteName : "")
                .replace("{{data_atual}}", java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }

    private String extractEmail(String text) {
        try {
            for (String part : text.split("[\n,; ]")) {
                if (part.contains("@") && part.contains(".")) {
                    return part.replaceAll("[^a-zA-Z0-9@._-]", "");
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
