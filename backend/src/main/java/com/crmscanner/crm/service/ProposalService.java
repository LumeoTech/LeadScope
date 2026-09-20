package com.crmscanner.crm.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.ProposalRequest;
import com.crmscanner.crm.dto.ProposalResponse;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.entity.LeadStatus;
import com.crmscanner.crm.entity.Proposal;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.crm.repository.LeadStatusRepository;
import com.crmscanner.crm.repository.ProposalRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final LeadRepository leadRepository;
    private final CompanyRepository companyRepository;
    private final LeadStatusRepository leadStatusRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<ProposalResponse> listAll() {
        return proposalRepository.findAll().stream()
                .map(ProposalResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProposalResponse> listByLead(Long leadId) {
        return proposalRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(ProposalResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProposalResponse> listByCompany(Long companyId) {
        return proposalRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(ProposalResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProposalResponse getById(Long id) {
        return ProposalResponse.fromEntity(getProposalEntity(id));
    }

    @Transactional
    public ProposalResponse create(ProposalRequest request, User currentUser) {
        Lead lead = leadRepository.findById(request.leadId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead", request.leadId()));

        Proposal proposal = new Proposal();
        proposal.setLead(lead);
        proposal.setCompany(lead.getCompany());
        proposal.setTitle(request.title().trim());
        proposal.setValue(request.value());
        proposal.setStatus("DRAFT");
        proposal.setValidUntil(request.validUntil());
        proposal.setItems(request.items());
        proposal.setNotes(request.notes());
        proposal.setCreatedBy(currentUser);

        Proposal saved = proposalRepository.save(proposal);

        auditService.log(
                "PROPOSAL",
                saved.getId(),
                "CREATE",
                null,
                Map.of("title", saved.getTitle(), "value", saved.getValue().toString(), "leadId", lead.getId()),
                "Proposta comercial gerada no valor de R$ " + saved.getValue() + ": " + saved.getTitle()
        );

        return ProposalResponse.fromEntity(saved);
    }

    @Transactional
    public ProposalResponse update(Long id, ProposalRequest request) {
        Proposal proposal = getProposalEntity(id);

        if ("ACCEPTED".equals(proposal.getStatus())) {
            throw new BusinessException("Não é possível alterar uma proposta já aceita.");
        }

        proposal.setTitle(request.title().trim());
        proposal.setValue(request.value());
        proposal.setValidUntil(request.validUntil());
        proposal.setItems(request.items());
        proposal.setNotes(request.notes());

        return ProposalResponse.fromEntity(proposalRepository.save(proposal));
    }

    @Transactional
    public ProposalResponse send(Long id) {
        Proposal proposal = getProposalEntity(id);
        proposal.setStatus("SENT");
        Proposal updated = proposalRepository.save(proposal);

        auditService.log(
                "PROPOSAL",
                updated.getId(),
                "STATUS_CHANGE",
                Map.of("status", "DRAFT"),
                Map.of("status", "SENT"),
                "Proposta enviada ao cliente: " + updated.getTitle()
        );

        return ProposalResponse.fromEntity(updated);
    }

    @Transactional
    public ProposalResponse accept(Long id) {
        Proposal proposal = getProposalEntity(id);
        String oldStatus = proposal.getStatus();

        proposal.setStatus("ACCEPTED");
        proposal.setAcceptedAt(LocalDateTime.now());
        Proposal updated = proposalRepository.save(proposal);

        // Converte a Empresa em Cliente ativo
        Company company = proposal.getCompany();
        company.setIsClient(true);
        if (company.getClientSince() == null) {
            company.setClientSince(LocalDateTime.now());
        }
        companyRepository.save(company);

        // Move o lead para o status "Fechado Ganho" se existir no funil
        Lead lead = proposal.getLead();
        Optional<LeadStatus> wonStatus = leadStatusRepository.findByActiveTrueOrderByPositionAsc().stream()
                .filter(s -> "Fechado Ganho".equalsIgnoreCase(s.getName()))
                .findFirst();

        wonStatus.ifPresent(leadStatus -> {
            lead.setStatus(leadStatus);
            leadRepository.save(lead);
        });

        auditService.log(
                "PROPOSAL",
                updated.getId(),
                "STATUS_CHANGE",
                Map.of("status", oldStatus),
                Map.of("status", "ACCEPTED"),
                "Proposta aceita! Empresa '" + company.getRazaoSocial() + "' convertida em Cliente com sucesso."
        );

        return ProposalResponse.fromEntity(updated);
    }

    @Transactional
    public ProposalResponse reject(Long id) {
        Proposal proposal = getProposalEntity(id);
        proposal.setStatus("REJECTED");
        Proposal updated = proposalRepository.save(proposal);

        auditService.log(
                "PROPOSAL",
                updated.getId(),
                "STATUS_CHANGE",
                null,
                Map.of("status", "REJECTED"),
                "Proposta rejeitada: " + updated.getTitle()
        );

        return ProposalResponse.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        Proposal proposal = getProposalEntity(id);
        proposalRepository.delete(proposal);
        auditService.log(
                "PROPOSAL",
                id,
                "DELETE",
                Map.of("title", proposal.getTitle(), "value", proposal.getValue()),
                null,
                "Proposta comercial excluída: " + proposal.getTitle()
        );
    }

    private Proposal getProposalEntity(Long id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta Comercial", id));
    }
}
