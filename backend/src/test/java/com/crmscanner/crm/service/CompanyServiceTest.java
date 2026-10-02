package com.crmscanner.crm.service;

import com.crmscanner.audit.service.AuditService;
import com.crmscanner.crm.dto.CompanyRequest;
import com.crmscanner.crm.dto.CompanyResponse;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.repository.CompanyRepository;
import com.crmscanner.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CompanyService companyService;

    private CompanyRequest request;

    @BeforeEach
    void setUp() {
        request = new CompanyRequest(
                "12.345.678/0001-99",
                "Empresa Teste LTDA",
                "Fantasia Teste",
                "Tecnologia",
                "EPP",
                "(11) 9999-8888",
                "contato@teste.com",
                "https://teste.com",
                "01000-000",
                "Av. Paulista",
                "1000",
                "Conjunto 10",
                "Bela Vista",
                "São Paulo",
                "SP",
                "MANUAL"
        );
    }

    @Test
    @DisplayName("Deve cadastrar nova empresa com sucesso quando CNPJ não existir")
    void shouldCreateCompanySuccessfully() {
        when(companyRepository.existsByCnpj("12.345.678/0001-99")).thenReturn(false);

        Company savedCompany = new Company();
        savedCompany.setId(1L);
        savedCompany.setCnpj(request.cnpj());
        savedCompany.setRazaoSocial(request.razaoSocial());
        savedCompany.setActive(true);
        savedCompany.setIsClient(false);

        when(companyRepository.save(any(Company.class))).thenReturn(savedCompany);

        CompanyResponse response = companyService.create(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Empresa Teste LTDA", response.razaoSocial());
        verify(companyRepository, times(1)).save(any(Company.class));
    }

    @Test
    @DisplayName("Deve retornar empresa existente de forma idempotente quando CNPJ já existir")
    void shouldReturnExistingCompanyWhenCnpjAlreadyExists() {
        when(companyRepository.existsByCnpj("12.345.678/0001-99")).thenReturn(true);

        Company existingCompany = new Company();
        existingCompany.setId(99L);
        existingCompany.setCnpj("12.345.678/0001-99");
        existingCompany.setRazaoSocial("Empresa Teste LTDA");
        existingCompany.setActive(true);
        existingCompany.setIsClient(false);

        when(companyRepository.findByCnpj("12.345.678/0001-99")).thenReturn(java.util.Optional.of(existingCompany));

        CompanyResponse response = companyService.create(request);

        assertNotNull(response);
        assertEquals(99L, response.id());
        assertEquals("Empresa Teste LTDA", response.razaoSocial());
        verify(companyRepository, never()).save(any(Company.class));
    }
}
