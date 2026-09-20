package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.Contact;

import java.time.LocalDateTime;

public record ContactResponse(
    Long id,
    Long companyId,
    String companyRazaoSocial,
    Long leadId,
    String leadTitle,
    String name,
    String role,
    String email,
    String phone,
    String whatsapp,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ContactResponse fromEntity(Contact c) {
        return new ContactResponse(
            c.getId(),
            c.getCompany() != null ? c.getCompany().getId() : null,
            c.getCompany() != null ? c.getCompany().getRazaoSocial() : null,
            c.getLead() != null ? c.getLead().getId() : null,
            c.getLead() != null ? c.getLead().getTitle() : null,
            c.getName(),
            c.getRole(),
            c.getEmail(),
            c.getPhone(),
            c.getWhatsapp(),
            c.getNotes(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
