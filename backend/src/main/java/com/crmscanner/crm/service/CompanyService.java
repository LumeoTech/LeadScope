package com.crmscanner.crm.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.CompanyRequest;
import com.crmscanner.crm.dto.CompanyResponse;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AuditService auditService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public Page<CompanyResponse> search(
            String search,
            String estado,
            String segmento,
            Boolean active,
            Pageable pageable
    ) {
        return companyRepository.searchCompanies(search, estado, segmento, active, pageable)
                .map(CompanyResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CompanyResponse findById(Long id) {
        return CompanyResponse.fromEntity(getCompanyEntity(id));
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        if (request.cnpj() != null && !request.cnpj().isBlank()) {
            String cleanCnpj = request.cnpj().trim();
            if (companyRepository.existsByCnpj(cleanCnpj)) {
                return CompanyResponse.fromEntity(companyRepository.findByCnpj(cleanCnpj).get());
            }
        } else if (request.razaoSocial() != null && !request.razaoSocial().isBlank()) {
            var existingByName = companyRepository.findFirstByRazaoSocialIgnoreCase(request.razaoSocial().trim());
            if (existingByName.isPresent()) {
                return CompanyResponse.fromEntity(existingByName.get());
            }
        }

        Company company = new Company();
        applyRequestData(company, request);
        company.setActive(true);
        company.setCreatedBy(getCurrentUser());

        Company saved = companyRepository.save(company);

        auditService.log(
                "COMPANY",
                saved.getId(),
                "CREATE",
                null,
                Map.of("razaoSocial", saved.getRazaoSocial(), "cnpj", saved.getCnpj() != null ? saved.getCnpj() : ""),
                "Empresa cadastrada: " + saved.getRazaoSocial()
        );

        return CompanyResponse.fromEntity(saved);
    }

    @Transactional
    public CompanyResponse update(Long id, CompanyRequest request) {
        Company company = getCompanyEntity(id);

        if (request.cnpj() != null && !request.cnpj().isBlank()) {
            String cleanCnpj = request.cnpj().trim();
            if (!cleanCnpj.equals(company.getCnpj()) && companyRepository.existsByCnpj(cleanCnpj)) {
                throw new BusinessException("Já existe outra empresa com este CNPJ: " + cleanCnpj);
            }
        }

        Map<String, Object> oldValue = Map.of(
                "razaoSocial", company.getRazaoSocial(),
                "cidade", company.getCidade() != null ? company.getCidade() : "",
                "estado", company.getEstado() != null ? company.getEstado() : ""
        );

        applyRequestData(company, request);

        Company updated = companyRepository.save(company);

        Map<String, Object> newValue = Map.of(
                "razaoSocial", updated.getRazaoSocial(),
                "cidade", updated.getCidade() != null ? updated.getCidade() : "",
                "estado", updated.getEstado() != null ? updated.getEstado() : ""
        );

        auditService.log(
                "COMPANY",
                updated.getId(),
                "UPDATE",
                oldValue,
                newValue,
                "Dados da empresa atualizados: " + updated.getRazaoSocial()
        );

        return CompanyResponse.fromEntity(updated);
    }

    @Transactional
    public CompanyResponse toggleStatus(Long id) {
        Company company = getCompanyEntity(id);
        boolean newStatus = !Boolean.TRUE.equals(company.getActive());
        company.setActive(newStatus);
        Company updated = companyRepository.save(company);

        auditService.log(
                "COMPANY",
                updated.getId(),
                "STATUS_CHANGE",
                Map.of("active", !newStatus),
                Map.of("active", newStatus),
                "Status da empresa alterado para " + (newStatus ? "ATIVO" : "INATIVO")
        );

        return CompanyResponse.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        Company company = getCompanyEntity(id);
        auditService.log(
                "COMPANY",
                company.getId(),
                "DELETE",
                Map.of("razaoSocial", company.getRazaoSocial()),
                null,
                "Empresa excluída: " + company.getRazaoSocial()
        );
        // Cascade delete all dependent records safely
        try {
            jdbcTemplate.update("DELETE FROM activities WHERE lead_id IN (SELECT id FROM leads WHERE company_id = ?)", id);
            jdbcTemplate.update("DELETE FROM lead_notes WHERE lead_id IN (SELECT id FROM leads WHERE company_id = ?)", id);
            jdbcTemplate.update("DELETE FROM contracts WHERE company_id = ?", id);
            jdbcTemplate.update("DELETE FROM company_agreements WHERE company_id = ?", id);
            jdbcTemplate.update("DELETE FROM proposals WHERE company_id = ?", id);
            jdbcTemplate.update("DELETE FROM contacts WHERE company_id = ?", id);
            jdbcTemplate.update("DELETE FROM leads WHERE company_id = ?", id);
        } catch (Exception ignored) {
            // Continues to delete company
        }
        companyRepository.delete(company);
    }

    public Company getCompanyEntity(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", id));
    }

    private void applyRequestData(Company company, CompanyRequest request) {
        company.setCnpj(request.cnpj() != null ? request.cnpj().trim() : null);
        company.setRazaoSocial(request.razaoSocial().trim());
        company.setNomeFantasia(request.nomeFantasia() != null ? request.nomeFantasia().trim() : null);
        company.setSegmento(request.segmento());
        company.setPorte(request.porte());
        company.setTelefone(request.telefone());
        company.setEmail(request.email());
        company.setWebsite(request.website());
        company.setCep(request.cep());
        company.setLogradouro(request.logradouro());
        company.setNumero(request.numero());
        company.setComplemento(request.complemento());
        company.setBairro(request.bairro());
        company.setCidade(request.cidade());
        company.setEstado(request.estado() != null ? request.estado().toUpperCase() : null);
        if (request.source() != null && !request.source().isBlank()) {
            company.setSource(request.source().toUpperCase());
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u;
        }
        return null;
    }
}
