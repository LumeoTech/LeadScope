package com.crmscanner.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
    String cnpj,

    @NotBlank(message = "A Razão Social é obrigatória")
    @Size(max = 300, message = "A Razão Social pode ter no máximo 300 caracteres")
    String razaoSocial,

    @Size(max = 300, message = "O Nome Fantasia pode ter no máximo 300 caracteres")
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
    @Size(max = 2, message = "Estado deve ser a sigla com 2 caracteres (UF)")
    String estado,
    String source
) {}
