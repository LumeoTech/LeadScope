package com.crmscanner.scanner.entity;

import com.crmscanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scanner_jobs")
@Getter
@Setter
@NoArgsConstructor
public class ScannerJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, RUNNING, DONE, FAILED

    @Column(nullable = false, length = 100)
    private String source = "MANUAL"; // MANUAL, RECEITA_FEDERAL, CNPJ_WS, BRASIL_API

    @Column(name = "filter_state", length = 2)
    private String filterState;

    @Column(name = "filter_city", length = 150)
    private String filterCity;

    @Column(name = "filter_cnae", length = 20)
    private String filterCnae;

    @Column(name = "filter_porte", length = 50)
    private String filterPorte;

    @Column(name = "total_found", nullable = false)
    private Integer totalFound = 0;

    @Column(name = "total_imported", nullable = false)
    private Integer totalImported = 0;

    @Column(name = "total_skipped", nullable = false)
    private Integer totalSkipped = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "started_by", nullable = false)
    private User startedBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScannerJobItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
