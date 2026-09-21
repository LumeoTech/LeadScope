package com.crmscanner.crm.service;

import com.crmscanner.auth.entity.User;
import com.crmscanner.auth.repository.UserRepository;
import com.crmscanner.crm.dto.LeadResponse;
import com.crmscanner.crm.dto.PublicLeadCaptureRequest;
import com.crmscanner.crm.dto.SiteDTO.*;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.entity.LeadStatus;
import com.crmscanner.crm.entity.Site;
import com.crmscanner.crm.entity.SiteEmailTemplate;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.crm.repository.LeadStatusRepository;
import com.crmscanner.crm.repository.SiteEmailTemplateRepository;
import com.crmscanner.crm.repository.SiteRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Serviço responsável pelo portfólio de websites desenvolvidos para clientes e templates de e-mail
@Service
@RequiredArgsConstructor
@Slf4j
public class SiteService {

    private final SiteRepository siteRepository;
    private final SiteEmailTemplateRepository templateRepository;
    private final LeadRepository leadRepository;
    private final CompanyRepository companyRepository;
    private final LeadStatusRepository leadStatusRepository;
    private final UserRepository userRepository;
    private final EmailDispatchService emailDispatchService;

    @Transactional(readOnly = true)
    public List<SiteResponse> listAll() {
        return siteRepository.findAll().stream()
                .map(SiteResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public SiteResponse getById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", id));
        return SiteResponse.fromEntity(site);
    }

    @Transactional
    public SiteResponse create(SiteCreateRequest request) {
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = request.name().trim().toLowerCase()
                    .replaceAll("[^a-z0-9]", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "") + "-" + System.currentTimeMillis() % 10000;
        } else {
            slug = slug.trim().toLowerCase();
        }

        if (siteRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Site site = new Site();
        site.setName(request.name().trim());
        site.setClientName(request.clientName());
        site.setUrl(request.url());
        site.setThumbnail(request.thumbnail());
        site.setDeliveryDate(request.deliveryDate());
        site.setStatus(request.status() != null && !request.status().isBlank() ? request.status() : "Online");
        site.setSlug(slug);
        site.setWebhookUrl(request.webhookUrl());
        site.setActive(request.active() != null ? request.active() : true);

        Site saved = siteRepository.save(site);
        return SiteResponse.fromEntity(saved);
    }

    @Transactional
    public SiteResponse update(Long id, SiteUpdateRequest request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", id));

        if (request.name() != null) site.setName(request.name().trim());
        if (request.clientName() != null) site.setClientName(request.clientName().trim());
        if (request.url() != null) site.setUrl(request.url());
        if (request.thumbnail() != null) site.setThumbnail(request.thumbnail());
        if (request.deliveryDate() != null) site.setDeliveryDate(request.deliveryDate());
        if (request.status() != null) site.setStatus(request.status());
        if (request.webhookUrl() != null) site.setWebhookUrl(request.webhookUrl());
        if (request.active() != null) site.setActive(request.active());

        Site updated = siteRepository.save(site);
        return SiteResponse.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Site", id);
        }
        siteRepository.deleteById(id);
    }

    // ==================== TEMPLATES ====================

    @Transactional(readOnly = true)
    public List<TemplateResponse> listAllTemplates() {
        return templateRepository.findAll().stream()
                .map(TemplateResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> listTemplates(Long siteId) {
        return templateRepository.findBySiteId(siteId).stream()
                .map(TemplateResponse::fromEntity)
                .toList();
    }

    @Transactional
    public TemplateResponse createTemplate(Long siteId, TemplateRequest request) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site", siteId));

        SiteEmailTemplate t = new SiteEmailTemplate();
        t.setSite(site);
        t.setName(request.name().trim());
        t.setTriggerEvent(request.triggerEvent() != null ? request.triggerEvent() : "LEAD_CAPTURED");
        t.setSubject(request.subject().trim());
        t.setBodyHtml(request.bodyHtml());
        t.setActive(request.active() != null ? request.active() : true);

        SiteEmailTemplate saved = templateRepository.save(t);
        return TemplateResponse.fromEntity(saved);
    }

    @Transactional
    public TemplateResponse updateTemplate(Long siteId, Long templateId, TemplateRequest request) {
        SiteEmailTemplate t = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template de E-mail", templateId));

        if (!t.getSite().getId().equals(siteId)) {
            throw new BusinessException("Template não pertence a este site.");
        }

        if (request.name() != null) t.setName(request.name().trim());
        if (request.triggerEvent() != null) t.setTriggerEvent(request.triggerEvent());
        if (request.subject() != null) t.setSubject(request.subject().trim());
        if (request.bodyHtml() != null) t.setBodyHtml(request.bodyHtml());
        if (request.active() != null) t.setActive(request.active());

        SiteEmailTemplate updated = templateRepository.save(t);
        return TemplateResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTemplate(Long siteId, Long templateId) {
        SiteEmailTemplate t = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template de E-mail", templateId));
        if (!t.getSite().getId().equals(siteId)) {
            throw new BusinessException("Template não pertence a este site.");
        }
        templateRepository.delete(t);
    }

    // ==================== CAPTURA AUTOMÁTICA DE LEAD E DISPARO DE TEMPLATE ====================

    @Transactional
    public LeadResponse captureLeadFromSite(String slug, PublicLeadCaptureRequest request) {
        Site site = siteRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException("Site não encontrado com identificador: " + slug));

        if (!Boolean.TRUE.equals(site.getActive())) {
            throw new BusinessException("A captura de leads para este site está desativada.");
        }

        // 1. Localiza ou cria a empresa
        String companyName = request.companyName() != null && !request.companyName().isBlank()
                ? request.companyName().trim()
                : request.name().trim();

        Company company = null;
        if (request.cnpj() != null && !request.cnpj().isBlank()) {
            company = companyRepository.findByCnpj(request.cnpj()).orElse(null);
        }

        if (company == null) {
            company = new Company();
            company.setRazaoSocial(companyName);
            company.setNomeFantasia(companyName);
            company.setCnpj(request.cnpj());
            company.setTelefone(request.phone());
            company.setEmail(request.email());
            company.setCidade(request.city());
            company.setEstado(request.state());
            company.setSource("SITE_" + site.getSlug().toUpperCase());
            company.setIsClient(false);
            company = companyRepository.save(company);
        }

        // 2. Status inicial
        LeadStatus initialStatus = leadStatusRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsDefault()))
                .findFirst()
                .orElseGet(() -> leadStatusRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("Nenhum status de lead configurado no CRM.")));

        // 3. Usuário criador (primeiro admin do sistema)
        User systemAdmin = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ADMIN".equalsIgnoreCase(u.getRole().getName()))
                .findFirst()
                .orElse(null);

        Lead lead = new Lead();
        lead.setCompany(company);
        lead.setStatus(initialStatus);
        lead.setTitle("Lead Capturado: " + request.name() + (request.companyName() != null ? " (" + request.companyName() + ")" : ""));
        lead.setDescription(String.format("Captura via site: %s\nContato: %s\nE-mail: %s\nTelefone: %s\nMensagem: %s",
                site.getName(), request.name(), request.email(), request.phone(), request.message() != null ? request.message() : "—"));
        lead.setValue(request.estimatedValue());
        lead.setSource("SITE_" + site.getSlug().toUpperCase());
        lead.setSite(site);
        lead.setCreatedBy(systemAdmin);

        Lead savedLead = leadRepository.save(lead);
        savedLead.setCode("LEAD-SITE-" + String.format("%04d", savedLead.getId()));
        final Lead finalLead = leadRepository.save(savedLead);

        // 4. Disparo automático do template de e-mail do site
        templateRepository.findFirstBySiteIdAndTriggerEventAndActiveTrue(site.getId(), "LEAD_CAPTURED")
                .ifPresent(template -> emailDispatchService.dispatchTemplate(template, finalLead, site));

        return LeadResponse.fromEntity(finalLead);
    }
}
