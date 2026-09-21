package com.crmscanner.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(length = 150)
    private String name;

    @Column(length = 255)
    private String email;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 20)
    private String theme = "dark";

    @Column(length = 10)
    private String language = "pt-BR";

    @Column(name = "notify_new_lead")
    private Boolean notifyNewLead = true;

    @Column(name = "notify_new_appointment")
    private Boolean notifyNewAppointment = true;

    @Column(name = "notify_daily_summary")
    private Boolean notifyDailySummary = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    @PrePersist
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
