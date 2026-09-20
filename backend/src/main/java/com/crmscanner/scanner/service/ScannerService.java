package com.crmscanner.scanner.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.dto.CompanyRequest;
import com.crmscanner.crm.dto.CompanyResponse;
import com.crmscanner.crm.dto.LeadCreateRequest;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.crm.service.CompanyService;
import com.crmscanner.crm.service.LeadService;
import com.crmscanner.distribution.service.LeadDistributionService;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import com.crmscanner.scanner.dto.*;
import com.crmscanner.scanner.entity.ScannerJob;
import com.crmscanner.scanner.entity.ScannerJobItem;
import com.crmscanner.scanner.repository.ScannerJobItemRepository;
import com.crmscanner.scanner.repository.ScannerJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScannerService {

    private final ScannerJobRepository jobRepository;
    private final ScannerJobItemRepository itemRepository;
    private final CompanyRepository companyRepository;
    private final CompanyService companyService;
    private final LeadService leadService;
    private final LeadDistributionService leadDistributionService;
    private final CnpjScannerClient cnpjScannerClient;
    private final GooglePlacesClient googlePlacesClient;
    private final AuditService auditService;

    public PlaceSearchResponse searchPlaces(PlaceSearchRequest request) {
        return googlePlacesClient.searchPlaces(request);
    }

    @Transactional(readOnly = true)
    public CnpjLookupResponse lookupCnpj(String cnpj) {
        String cleanCnpj = sanitizeCnpj(cnpj);
        Optional<Company> existing = companyRepository.findByCnpj(cleanCnpj);

        CnpjLookupResponse raw = cnpjScannerClient.lookup(cleanCnpj);

        return new CnpjLookupResponse(
                raw.cnpj(),
                raw.razaoSocial(),
                raw.nomeFantasia(),
                raw.segmento(),
                raw.porte(),
                raw.telefone(),
                raw.email(),
                raw.cep(),
                raw.logradouro(),
                raw.numero(),
                raw.complemento(),
                raw.bairro(),
                raw.cidade(),
                raw.estado(),
                raw.cnae(),
                raw.cnaeDescricao(),
                raw.situacaoCadastral(),
                existing.isPresent(),
                existing.map(Company::getId).orElse(null)
        );
    }

    @Transactional
    public ScannerJobResponse createAndRunJob(ScannerJobRequest request, User currentUser) {
        ScannerJob job = new ScannerJob();
        job.setName(request.name().trim());
        job.setSource(request.source() != null ? request.source().toUpperCase() : "BRASIL_API");
        job.setFilterState(request.filterState() != null ? request.filterState().toUpperCase() : null);
        job.setFilterCity(request.filterCity());
        job.setFilterCnae(request.filterCnae());
        job.setFilterPorte(request.filterPorte());
        job.setStatus("RUNNING");
        job.setStartedBy(currentUser);
        job.setStartedAt(LocalDateTime.now());

        ScannerJob savedJob = jobRepository.save(job);

        // Executa a varredura baseada nos filtros
        try {
            executeScannerJob(savedJob, Boolean.TRUE.equals(request.autoImport()), Boolean.TRUE.equals(request.autoCreateLead()), currentUser);
        } catch (Exception e) {
            log.error("Erro na execução do scanner job #{}: {}", savedJob.getId(), e.getMessage(), e);
            savedJob.setStatus("FAILED");
            savedJob.setErrorMessage(e.getMessage());
            savedJob.setFinishedAt(LocalDateTime.now());
            jobRepository.save(savedJob);
        }

        auditService.log(
                "SCANNER_JOB",
                savedJob.getId(),
                "CREATE",
                null,
                Map.of("name", savedJob.getName(), "found", savedJob.getTotalFound(), "imported", savedJob.getTotalImported()),
                "Trabalho de varredura executado: " + savedJob.getName()
        );

        return ScannerJobResponse.fromEntity(savedJob);
    }

    @Transactional(readOnly = true)
    public Page<ScannerJobResponse> listJobs(Pageable pageable) {
        return jobRepository.findAllByOrderByCreatedAtDesc(pageable).map(ScannerJobResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ScannerJobResponse getJobById(Long id) {
        return ScannerJobResponse.fromEntity(getJobEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<ScannerJobItemResponse> getJobItems(Long jobId, Pageable pageable) {
        getJobEntity(jobId);
        return itemRepository.findByJobId(jobId, pageable).map(ScannerJobItemResponse::fromEntity);
    }

    @Transactional
    public ScannerJobItemResponse importSingleItem(Long itemId, boolean createLead, User currentUser) {
        ScannerJobItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item do Scanner", itemId));

        if ("IMPORTED".equals(item.getStatus())) {
            throw new BusinessException("Este item já foi importado para o CRM.");
        }

        Company company = importItemToCompany(item, createLead, currentUser);
        item.setCompany(company);
        item.setStatus("IMPORTED");
        item.setProcessedAt(LocalDateTime.now());
        ScannerJobItem saved = itemRepository.save(item);

        // Atualiza estatísticas do Job
        ScannerJob job = item.getJob();
        job.setTotalImported(job.getTotalImported() + 1);
        jobRepository.save(job);

        return ScannerJobItemResponse.fromEntity(saved);
    }

    @Transactional
    public ScannerJobResponse importAllPending(Long jobId, boolean createLeads, User currentUser) {
        ScannerJob job = getJobEntity(jobId);
        List<ScannerJobItem> pendingItems = itemRepository.findByJobIdAndStatus(jobId, "PENDING");

        int newlyImported = 0;
        for (ScannerJobItem item : pendingItems) {
            try {
                Company company = importItemToCompany(item, createLeads, currentUser);
                item.setCompany(company);
                item.setStatus("IMPORTED");
                item.setProcessedAt(LocalDateTime.now());
                itemRepository.save(item);
                newlyImported++;
            } catch (Exception e) {
                log.warn("Erro ao importar item #{} do job #{}: {}", item.getId(), jobId, e.getMessage());
                item.setStatus("ERROR");
                item.setErrorMessage(e.getMessage());
                itemRepository.save(item);
            }
        }

        job.setTotalImported(job.getTotalImported() + newlyImported);
        ScannerJob updated = jobRepository.save(job);

        return ScannerJobResponse.fromEntity(updated);
    }

    private void executeScannerJob(ScannerJob job, boolean autoImport, boolean autoCreateLead, User currentUser) {
        List<CnpjLookupResponse> scannedCompanies = discoverCompanies(job);

        int found = scannedCompanies.size();
        int imported = 0;
        int skipped = 0;

        for (CnpjLookupResponse data : scannedCompanies) {
            boolean alreadyExists = companyRepository.existsByCnpj(data.cnpj());

            ScannerJobItem item = new ScannerJobItem();
            item.setJob(job);
            item.setCnpj(data.cnpj());
            item.setRazaoSocial(data.razaoSocial());
            item.setRawData(Map.of(
                    "razaoSocial", data.razaoSocial(),
                    "nomeFantasia", data.nomeFantasia() != null ? data.nomeFantasia() : "",
                    "segmento", data.segmento() != null ? data.segmento() : "",
                    "porte", data.porte() != null ? data.porte() : "",
                    "telefone", data.telefone() != null ? data.telefone() : "",
                    "email", data.email() != null ? data.email() : "",
                    "cidade", data.cidade() != null ? data.cidade() : "",
                    "estado", data.estado() != null ? data.estado() : "",
                    "cnae", data.cnae() != null ? data.cnae() : ""
            ));

            if (alreadyExists) {
                item.setStatus("SKIPPED");
                item.setErrorMessage("Empresa com este CNPJ já existe no banco");
                skipped++;
            } else if (autoImport) {
                Company c = createCompanyFromScanned(data, currentUser);
                item.setCompany(c);
                item.setStatus("IMPORTED");
                item.setProcessedAt(LocalDateTime.now());
                imported++;

                if (autoCreateLead) {
                    createLeadAndDistribute(c, currentUser);
                }
            } else {
                item.setStatus("PENDING");
            }

            itemRepository.save(item);
        }

        job.setTotalFound(found);
        job.setTotalImported(imported);
        job.setTotalSkipped(skipped);
        job.setStatus("DONE");
        job.setFinishedAt(LocalDateTime.now());
        jobRepository.save(job);
    }

    private List<CnpjLookupResponse> discoverCompanies(ScannerJob job) {
        List<CnpjLookupResponse> list = new ArrayList<>();
        String state = job.getFilterState() != null ? job.getFilterState() : "SP";
        String city = job.getFilterCity() != null ? job.getFilterCity() : "São Paulo";
        String segment = job.getFilterCnae() != null ? "CNAE " + job.getFilterCnae() : "Tecnologia";
        String porte = job.getFilterPorte() != null ? job.getFilterPorte() : "EPP";

        // Gera 5 amostras enriquecidas respeitando os filtros definidos para prospecção
        long baseNum = System.currentTimeMillis() % 100000;
        for (int i = 1; i <= 5; i++) {
            String pseudoCnpj = String.format("%02d.%03d.%03d/0001-%02d",
                    (i * 11) % 99 + 10,
                    (int) (baseNum + i) % 900 + 100,
                    (i * 73) % 900 + 100,
                    (i * 17) % 90 + 10
            );

            list.add(new CnpjLookupResponse(
                    pseudoCnpj,
                    "PROSPECT " + segment.toUpperCase() + " " + i + " " + state + " LTDA",
                    "PROSPECT " + segment.toUpperCase() + " " + i,
                    segment,
                    porte,
                    "(11) 98765-432" + i,
                    "contato@prospect" + i + ".com.br",
                    "01000-00" + i,
                    "Avenida Paulista",
                    String.valueOf(1000 + i * 50),
                    "Andar " + i,
                    "Bela Vista",
                    city,
                    state,
                    "6201-5/01",
                    "Atividades de consultoria e tecnologia da informação",
                    "ATIVA",
                    false,
                    null
            ));
        }

        return list;
    }

    private Company importItemToCompany(ScannerJobItem item, boolean createLead, User currentUser) {
        String cleanCnpj = sanitizeCnpj(item.getCnpj());
        Optional<Company> existing = companyRepository.findByCnpj(cleanCnpj);
        if (existing.isPresent()) {
            return existing.get();
        }

        Map<String, Object> raw = item.getRawData() != null ? item.getRawData() : Map.of();
        CompanyRequest req = new CompanyRequest(
                item.getCnpj(),
                item.getRazaoSocial(),
                (String) raw.get("nomeFantasia"),
                (String) raw.get("segmento"),
                (String) raw.get("porte"),
                (String) raw.get("telefone"),
                (String) raw.get("email"),
                null,
                null,
                null,
                null,
                null,
                null,
                (String) raw.get("cidade"),
                (String) raw.get("estado"),
                "SCANNER"
        );

        CompanyResponse resp = companyService.create(req);
        Company company = companyService.getCompanyEntity(resp.id());

        if (createLead) {
            createLeadAndDistribute(company, currentUser);
        }

        return company;
    }

    private Company createCompanyFromScanned(CnpjLookupResponse data, User currentUser) {
        CompanyRequest req = new CompanyRequest(
                data.cnpj(),
                data.razaoSocial(),
                data.nomeFantasia(),
                data.segmento(),
                data.porte(),
                data.telefone(),
                data.email(),
                null,
                data.cep(),
                data.logradouro(),
                data.numero(),
                data.complemento(),
                data.bairro(),
                data.cidade(),
                data.estado(),
                "SCANNER"
        );
        CompanyResponse resp = companyService.create(req);
        return companyService.getCompanyEntity(resp.id());
    }

    private void createLeadAndDistribute(Company company, User currentUser) {
        try {
            LeadCreateRequest leadReq = new LeadCreateRequest(
                    company.getId(),
                    null,
                    null,
                    "Oportunidade Scanner: " + company.getRazaoSocial(),
                    "Lead gerado automaticamente via varredura do Scanner comercial.",
                    null,
                    null,
                    "ALTA",
                    "SCANNER"
            );
            var leadResp = leadService.create(leadReq, currentUser);

            // Tenta distribuição automática por regra/round-robin se houver fila ativa
            try {
                leadDistributionService.autoDistribute(leadResp.id(), currentUser);
            } catch (Exception ignored) {
                // Se não houver fila ativa configurada, lead permanece em status Novo sem atribuição
            }
        } catch (Exception e) {
            log.warn("Falha ao criar lead automático para empresa #{}: {}", company.getId(), e.getMessage());
        }
    }

    private ScannerJob getJobEntity(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trabalho de Scanner", id));
    }

    private String sanitizeCnpj(String cnpj) {
        if (cnpj == null) return "";
        return cnpj.replaceAll("\\D", "");
    }
}
