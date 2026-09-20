package com.crmscanner.crm.service;

import com.crmscanner.crm.dto.ContractRequest;
import com.crmscanner.crm.dto.ContractResponse;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Contract;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.crm.repository.ContractRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final CompanyRepository companyRepository;
    private final LeadRepository leadRepository;
    private final DocuSealClient docuSealClient;

    @Transactional
    public ContractResponse sendContract(ContractRequest request) {
        Company company = null;
        if (request.companyId() != null) {
            company = companyRepository.findById(request.companyId())
                    .orElse(null);
        }

        Lead lead = null;
        if (request.leadId() != null) {
            lead = leadRepository.findById(request.leadId())
                    .orElse(null);
            if (company == null && lead != null) {
                company = lead.getCompany();
            }
        }

        DocuSealClient.DocuSealResult docuResult = docuSealClient.createSubmission(
                request.templateName(),
                request.recipientName(),
                request.recipientEmail(),
                request.recipientPhone()
        );

        Contract contract = new Contract();
        contract.setCompany(company);
        contract.setLead(lead);
        contract.setTemplateName(request.templateName());
        contract.setRecipientName(request.recipientName());
        contract.setRecipientEmail(request.recipientEmail());
        contract.setRecipientPhone(request.recipientPhone());
        contract.setStatus("PENDING");
        contract.setDocusealSubmissionId(docuResult.submissionId());
        contract.setDocumentUrl(docuResult.slug());

        Contract saved = contractRepository.save(contract);
        log.info("Contrato digital enviado. ID: {}, SubID: {}, URL: {}", saved.getId(), saved.getDocusealSubmissionId(), saved.getDocumentUrl());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> listAll() {
        return contractRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> listByCompany(Long companyId) {
        return contractRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> listByLead(Long leadId) {
        return contractRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ContractResponse simulateSign(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado: " + id));

        contract.setStatus("COMPLETED");
        Contract saved = contractRepository.save(contract);
        log.info("Contrato {} assinado com sucesso (simulação/webhook)", id);

        return toResponse(saved);
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        if (payload == null) return;
        String eventType = (String) payload.get("event_type");
        log.info("DocuSeal Webhook recebido: {}", eventType);

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data != null && data.get("id") != null) {
            String submissionId = String.valueOf(data.get("id"));
            contractRepository.findByDocusealSubmissionId(submissionId).ifPresent(contract -> {
                if ("form.completed".equals(eventType) || "submission.completed".equals(eventType)) {
                    contract.setStatus("COMPLETED");
                } else if ("form.declined".equals(eventType) || "submission.rejected".equals(eventType)) {
                    contract.setStatus("REJECTED");
                }
                contractRepository.save(contract);
                log.info("Status do contrato {} atualizado para {} via webhook", contract.getId(), contract.getStatus());
            });
        }
    }

    private ContractResponse toResponse(Contract c) {
        return new ContractResponse(
                c.getId(),
                c.getCompany() != null ? c.getCompany().getId() : null,
                c.getLead() != null ? c.getLead().getId() : null,
                c.getCompany() != null ? c.getCompany().getRazaoSocial() : (c.getRecipientName()),
                c.getTemplateName(),
                c.getRecipientName(),
                c.getRecipientEmail(),
                c.getRecipientPhone(),
                c.getStatus(),
                c.getDocumentUrl(),
                c.getDocusealSubmissionId(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
