package com.crmscanner.scanner.dto;

public record CnpjLookupResponse(
    String cnpj,
    String razaoSocial,
    String nomeFantasia,
    String segmento,
    String porte,
    String telefone,
    String email,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String cnae,
    String cnaeDescricao,
    String situacaoCadastral,
    boolean alreadyExists,
    Long existingCompanyId
) {}
