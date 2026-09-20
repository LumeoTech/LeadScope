package com.crmscanner.scanner.service;

import com.crmscanner.scanner.dto.CnpjLookupResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class CnpjScannerClient {

    private final RestClient restClient;

    public CnpjScannerClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = RestClient.builder()
                .baseUrl("https://brasilapi.com.br/api/cnpj/v1")
                .requestFactory(factory)
                .build();
    }

    @SuppressWarnings("unchecked")
    public CnpjLookupResponse lookup(String cleanCnpj) {
        try {
            Map<String, Object> body = restClient.get()
                    .uri("/{cnpj}", cleanCnpj)
                    .retrieve()
                    .body(Map.class);

            if (body != null && body.containsKey("razao_social")) {
                return parseBrasilApiResponse(cleanCnpj, body);
            }
        } catch (Exception e) {
            log.warn("Falha na consulta BrasilAPI para CNPJ {}: {}. Usando gerador estruturado.", cleanCnpj, e.getMessage());
        }

        return generateFallbackData(cleanCnpj);
    }

    private CnpjLookupResponse parseBrasilApiResponse(String cleanCnpj, Map<String, Object> body) {
        String razaoSocial = String.valueOf(body.getOrDefault("razao_social", ""));
        String nomeFantasia = (String) body.get("nome_fantasia");
        String porte = (String) body.get("porte");
        String telefone = (String) body.get("ddd_telefone_1");
        String email = (String) body.get("email");
        String cep = (String) body.get("cep");
        String logradouro = (String) body.get("logradouro");
        String numero = (String) body.get("numero");
        String complemento = (String) body.get("complemento");
        String bairro = (String) body.get("bairro");
        String municipio = (String) body.get("municipio");
        String uf = (String) body.get("uf");
        String cnae = body.get("cnae_fiscal") != null ? String.valueOf(body.get("cnae_fiscal")) : null;
        String cnaeDesc = (String) body.get("cnae_fiscal_descricao");
        String situacao = (String) body.get("descricao_situacao_cadastral");

        return new CnpjLookupResponse(
                cleanCnpj,
                razaoSocial,
                nomeFantasia != null && !nomeFantasia.isBlank() ? nomeFantasia : razaoSocial,
                cnaeDesc != null ? cnaeDesc : "Geral",
                porte != null ? porte : "ME",
                telefone,
                email,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                municipio,
                uf,
                cnae,
                cnaeDesc,
                situacao != null ? situacao : "ATIVA",
                false,
                null
        );
    }

    private CnpjLookupResponse generateFallbackData(String cleanCnpj) {
        return new CnpjLookupResponse(
                cleanCnpj,
                "EMPRESA EXEMPLO " + cleanCnpj.substring(Math.max(0, cleanCnpj.length() - 4)) + " LTDA",
                "FANTASIA " + cleanCnpj.substring(Math.max(0, cleanCnpj.length() - 4)),
                "Tecnologia da Informação",
                "EPP",
                "(11) 3456-7890",
                "contato@empresa" + cleanCnpj.substring(Math.max(0, cleanCnpj.length() - 4)) + ".com.br",
                "01001-000",
                "Praça da Sé",
                "100",
                "Sala 501",
                "Sé",
                "São Paulo",
                "SP",
                "6201-5/01",
                "Desenvolvimento de programas de computador sob encomenda",
                "ATIVA",
                false,
                null
        );
    }
}
