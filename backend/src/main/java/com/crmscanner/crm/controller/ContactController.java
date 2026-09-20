package com.crmscanner.crm.controller;

import com.crmscanner.crm.dto.ContactRequest;
import com.crmscanner.crm.dto.ContactResponse;
import com.crmscanner.crm.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Tag(name = "Contatos", description = "Gerenciamento de pessoas de contato vinculadas a empresas e leads")
@SecurityRequirement(name = "bearerAuth")
public class ContactController {

    private final ContactService contactService;

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Listar por empresa", description = "Retorna todos os contatos de uma empresa")
    public ResponseEntity<List<ContactResponse>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(contactService.findByCompany(companyId));
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "Listar por lead", description = "Retorna contatos vinculados a um lead específico")
    public ResponseEntity<List<ContactResponse>> getByLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(contactService.findByLead(leadId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter contato", description = "Detalhes de um contato por ID")
    public ResponseEntity<ContactResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar contato", description = "Cadastra uma nova pessoa de contato")
    public ResponseEntity<ContactResponse> create(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar contato", description = "Atualiza os dados de uma pessoa de contato")
    public ResponseEntity<ContactResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request
    ) {
        return ResponseEntity.ok(contactService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir contato", description = "Remove um contato do sistema")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
