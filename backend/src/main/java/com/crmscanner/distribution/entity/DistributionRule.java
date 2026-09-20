package com.crmscanner.distribution.entity;

import com.crmscanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "distribution_rules")
@Getter
@Setter
@NoArgsConstructor
public class DistributionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String strategy = "ROUND_ROBIN"; // ROUND_ROBIN, MANUAL, SEGMENTO, REGIAO

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(name = "filter_state", length = 2)
    private String filterState;

    @Column(name = "filter_segment", length = 150)
    private String filterSegment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DistributionRuleMember> members = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
