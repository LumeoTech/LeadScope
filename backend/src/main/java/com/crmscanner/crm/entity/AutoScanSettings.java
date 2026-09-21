package com.crmscanner.crm.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "auto_scan_settings")
@Getter
@Setter
@NoArgsConstructor
public class AutoScanSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "scheduled_time", nullable = false, length = 10)
    private String scheduledTime = "06:00";

    @Column(name = "leads_per_day", nullable = false)
    private Integer leadsPerDay = 10;

    @Column(name = "min_acceptance_score", nullable = false)
    private Integer minAcceptanceScore = 70;

    @Column(name = "location_tier", nullable = false, length = 50)
    private String locationTier = "ALTO"; // ALTO, MEDIO, QUALQUER

    @Column(name = "discarded_leads_count", nullable = false)
    private Integer discardedLeadsCount = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    @PrePersist
    public void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
