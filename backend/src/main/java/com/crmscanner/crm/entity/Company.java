package com.crmscanner.crm.entity;

import com.crmscanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 18, unique = true)
    private String cnpj;

    @Column(name = "razao_social", nullable = false, length = 300)
    private String razaoSocial;

    @Column(name = "nome_fantasia", length = 300)
    private String nomeFantasia;

    @Column(length = 150)
    private String segmento;

    @Column(length = 50)
    private String porte;

    @Column(length = 30)
    private String telefone;

    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String website;

    @Column(length = 10)
    private String cep;

    @Column(length = 300)
    private String logradouro;

    @Column(length = 20)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 150)
    private String bairro;

    @Column(length = 150)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(nullable = false, length = 50)
    private String source = "MANUAL";

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "is_client", nullable = false)
    private Boolean isClient = false;

    @Column(name = "client_since")
    private LocalDateTime clientSince;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
