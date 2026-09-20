package com.crmscanner.crm.controller;

import com.crmscanner.crm.dto.CompanyRequest;
import com.crmscanner.crm.dto.CompanyResponse;
import com.crmscanner.crm.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Empresas", description = "Cadastro e consulta de empresas/organizações")
@SecurityRequirement(name = "bearerAuth")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "Listar empresas", description = "Busca paginada com filtros por termo, estado, segmento e status")
    public ResponseEntity<Page<CompanyResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String segmento,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "razaoSocial", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(companyService.search(search, estado, segmento, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter empresa", description = "Detalhes de uma empresa por ID")
    public ResponseEntity<CompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar empresa", description = "Cadastra uma nova empresa no sistema")
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar empresa", description = "Atualiza os dados de uma empresa cadastrada")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request
    ) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar status", description = "Ativa ou desativa uma empresa (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<CompanyResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir empresa", description = "Remove uma empresa do sistema (Admin/Gerente)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
