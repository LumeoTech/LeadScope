package com.crmscanner.crm.entity;

import com.crmscanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private LeadStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "code", length = 50, unique = true)
    private String code;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "\"value\"", precision = 15, scale = 2)
    private BigDecimal value;

    @Column(name = "expected_close")
    private LocalDate expectedClose;

    @Column(nullable = false, length = 20)
    private String priority = "MEDIA"; // BAIXA, MEDIA, ALTA, URGENTE

    @Column(nullable = false, length = 50)
    private String source = "MANUAL"; // MANUAL, SCANNER, INDICACAO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @Column(name = "acceptance_chance", precision = 5, scale = 2)
    private BigDecimal acceptanceChance;

    @Column(name = "cost_of_living", length = 100)
    private String costOfLiving;

    @Column(name = "location_potential", length = 100)
    private String locationPotential;

    @Column(name = "score_rationale", columnDefinition = "TEXT")
    private String scoreRationale;

    @Column(name = "score")
    private Integer score;

    @Column(name = "website_content_summary", columnDefinition = "TEXT")
    private String websiteContentSummary;

    @Column(name = "google_rating", precision = 3, scale = 1)
    private BigDecimal googleRating;

    @Column(name = "google_reviews_count")
    private Integer googleReviewsCount;

    @Column(name = "region_tier", length = 100)
    private String regionTier;

    @Column(name = "digital_presence_tier", length = 100)
    private String digitalPresenceTier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
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
