package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Company;

import java.time.LocalDateTime;

public record CompanyResponse(
    Long id,
    String cnpj,
    String razaoSocial,
    String nomeFantasia,
    String segmento,
    String porte,
    String telefone,
    String email,
    String website,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String source,
    Boolean active,
    Boolean isClient,
    LocalDateTime clientSince,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static CompanyResponse fromEntity(Company c) {
        return new CompanyResponse(
            c.getId(),
            c.getCnpj(),
            c.getRazaoSocial(),
            c.getNomeFantasia(),
            c.getSegmento(),
            c.getPorte(),
            c.getTelefone(),
            c.getEmail(),
            c.getWebsite(),
            c.getCep(),
            c.getLogradouro(),
            c.getNumero(),
            c.getComplemento(),
            c.getBairro(),
            c.getCidade(),
            c.getEstado(),
            c.getSource(),
            c.getActive(),
            c.getIsClient(),
            c.getClientSince(),
            c.getCreatedBy() != null ? c.getCreatedBy().getId() : null,
            c.getCreatedBy() != null ? c.getCreatedBy().getName() : null,
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
