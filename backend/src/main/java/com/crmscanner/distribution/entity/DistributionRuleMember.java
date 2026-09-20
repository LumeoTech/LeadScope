package com.crmscanner.distribution.entity;

import com.crmscanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "distribution_rule_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"rule_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class DistributionRuleMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private DistributionRule rule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer weight = 1;

    @Column(nullable = false)
    private Boolean active = true;
}
