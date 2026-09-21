package com.crmscanner.crm.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 300)
    private String url;

    @Column(name = "client_name", length = 150)
    private String clientName;

    @Column(length = 50)
    private String status = "Online"; // Online, Em desenvolvimento, Em manutenção

    @Column(name = "delivery_date")
    private java.time.LocalDate deliveryDate;

    @Column(length = 500)
    private String thumbnail;

    @Column(unique = true, length = 100)
    private String slug;

    @Column(name = "webhook_url", length = 300)
    private String webhookUrl;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SiteEmailTemplate> templates = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
