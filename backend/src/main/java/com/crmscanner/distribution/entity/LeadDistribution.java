package com.crmscanner.distribution.entity;

import com.crmscanner.auth.entity.User;
import com.crmscanner.crm.entity.Lead;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lead_distributions")
@Getter
@Setter
@NoArgsConstructor
public class LeadDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private DistributionRule rule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", nullable = false)
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "distributed_at", nullable = false, updatable = false)
    private LocalDateTime distributedAt = LocalDateTime.now();
}
