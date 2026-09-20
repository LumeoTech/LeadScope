package com.crmscanner.crm.service;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.AgreementAcceptRequest;
import com.crmscanner.crm.dto.AgreementCreateRequest;
import com.crmscanner.crm.dto.AgreementResponse;
import com.crmscanner.crm.entity.Agreement;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.repository.AgreementRepository;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final CompanyRepository companyRepository;
    private final LeadRepository leadRepository;

    @Transactional
    public AgreementResponse createAgreement(AgreementCreateRequest request, User currentUser) {
        Long targetCompanyId = request.clientId() != null ? request.clientId() : request.companyId();
        Company company = null;
        if (targetCompanyId != null) {
            company = companyRepository.findById(targetCompanyId).orElse(null);
        }

        Lead lead = null;
        if (request.leadId() != null) {
            lead = leadRepository.findById(request.leadId()).orElse(null);
            if (company == null && lead != null) {
                company = lead.getCompany();
            }
        }

        String token = UUID.randomUUID().toString().replace("-", "");

        Agreement agreement = new Agreement();
        agreement.setCompany(company);
        agreement.setLead(lead);
        agreement.setClientName(request.clientName() != null ? request.clientName().trim() : (company != null ? company.getRazaoSocial() : "Cliente"));
        agreement.setClientEmail(request.clientEmail() != null ? request.clientEmail().trim() : (company != null ? company.getEmail() : null));
        agreement.setTermContent(request.termContent().trim());
        agreement.setToken(token);
        agreement.setStatus("PENDING");
        agreement.setCreatedBy(currentUser);

        Agreement saved = agreementRepository.save(agreement);
        log.info("Acordo comercial gerado com sucesso. ID: {}, Token: {}", saved.getId(), saved.getToken());

        return AgreementResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public AgreementResponse getByToken(String token) {
        Agreement agreement = agreementRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Acordo comercial não encontrado ou expirado."));
        return AgreementResponse.fromEntity(agreement);
    }

    @Transactional
    public AgreementResponse acceptAgreement(String token, AgreementAcceptRequest request, String ipAddress, String userAgent) {
        Agreement agreement = agreementRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Acordo comercial não encontrado."));

        if ("ACCEPTED".equalsIgnoreCase(agreement.getStatus())) {
            return AgreementResponse.fromEntity(agreement);
        }

        String sha256 = calculateSha256(agreement.getTermContent());

        agreement.setStatus("ACCEPTED");
        agreement.setAcceptedByName(request.fullName().trim());
        agreement.setAcceptedAt(LocalDateTime.now());
        agreement.setIpAddress(ipAddress);
        agreement.setUserAgent(userAgent);
        agreement.setContentSha256(sha256);

        Agreement saved = agreementRepository.save(agreement);
        log.info("Acordo comercial aceito digitalmente por {} em {}. SHA256: {}", saved.getAcceptedByName(), saved.getAcceptedAt(), sha256);

        return AgreementResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AgreementResponse> listByClient(Long clientId) {
        return agreementRepository.findByCompanyIdOrderByCreatedAtDesc(clientId).stream()
                .map(AgreementResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgreementResponse> listByLead(Long leadId) {
        return agreementRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(AgreementResponse::fromEntity)
                .toList();
    }

    private String calculateSha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException("Erro ao calcular integridade do termo (SHA-256).");
        }
    }
}
