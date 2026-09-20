package com.crmscanner.crm.dto;

import com.crmscanner.crm.entity.LeadNote;

import java.time.LocalDateTime;

public record LeadNoteResponse(
    Long id,
    Long leadId,
    Long userId,
    String authorName,
    String content,
    Boolean isStatusChange,
    LocalDateTime createdAt
) {
    public static LeadNoteResponse fromEntity(LeadNote note) {
        return new LeadNoteResponse(
            note.getId(),
            note.getLead() != null ? note.getLead().getId() : null,
            note.getUser() != null ? note.getUser().getId() : null,
            note.getAuthorName(),
            note.getContent(),
            note.getIsStatusChange(),
            note.getCreatedAt()
        );
    }
}
