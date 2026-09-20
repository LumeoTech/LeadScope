package com.crmscanner.crm.service;

import com.crmscanner.crm.dto.LeadStatusRequest;
import com.crmscanner.crm.dto.LeadStatusResponse;
import com.crmscanner.crm.entity.LeadStatus;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.crm.repository.LeadStatusRepository;
import com.crmscanner.exception.BusinessException;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadStatusService {

    private final LeadStatusRepository leadStatusRepository;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public List<LeadStatusResponse> listAllActive() {
        return leadStatusRepository.findByActiveTrueOrderByPositionAsc().stream()
                .map(LeadStatusResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadStatusResponse findById(Long id) {
        return LeadStatusResponse.fromEntity(getStatusEntity(id));
    }

    @Transactional
    public LeadStatusResponse create(LeadStatusRequest request) {
        if (leadStatusRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new BusinessException("Já existe um status de funil com este nome: " + request.name());
        }

        LeadStatus status = new LeadStatus();
        status.setName(request.name().trim());
        status.setColor(request.color() != null ? request.color() : "#6366F1");
        status.setPosition(request.position());
        status.setIsFinal(Boolean.TRUE.equals(request.isFinal()));
        status.setActive(true);

        if (Boolean.TRUE.equals(request.isDefault())) {
            leadStatusRepository.findByIsDefaultTrue().ifPresent(curr -> curr.setIsDefault(false));
            status.setIsDefault(true);
        } else {
            status.setIsDefault(false);
        }

        return LeadStatusResponse.fromEntity(leadStatusRepository.save(status));
    }

    @Transactional
    public LeadStatusResponse update(Long id, LeadStatusRequest request) {
        LeadStatus status = getStatusEntity(id);

        status.setName(request.name().trim());
        if (request.color() != null) status.setColor(request.color());
        status.setPosition(request.position());
        if (request.isFinal() != null) status.setIsFinal(request.isFinal());

        if (Boolean.TRUE.equals(request.isDefault())) {
            leadStatusRepository.findByIsDefaultTrue().ifPresent(curr -> {
                if (!curr.getId().equals(id)) {
                    curr.setIsDefault(false);
                }
            });
            status.setIsDefault(true);
        }

        return LeadStatusResponse.fromEntity(leadStatusRepository.save(status));
    }

    @Transactional
    public void delete(Long id) {
        LeadStatus status = getStatusEntity(id);
        long count = leadRepository.countByStatusId(id);
        if (count > 0) {
            throw new BusinessException("Não é possível excluir este status pois existem " + count + " lead(s) vinculados.");
        }
        status.setActive(false);
        leadStatusRepository.save(status);
    }

    public LeadStatus getDefaultStatus() {
        return leadStatusRepository.findByIsDefaultTrue()
                .orElseGet(() -> leadStatusRepository.findByActiveTrueOrderByPositionAsc().stream()
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("Nenhum status configurado no funil.")));
    }

    public LeadStatus getStatusEntity(Long id) {
        return leadStatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status de Lead", id));
    }
}
