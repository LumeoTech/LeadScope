package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeadStatusRepository extends JpaRepository<LeadStatus, Long> {

    List<LeadStatus> findByActiveTrueOrderByPositionAsc();

    Optional<LeadStatus> findByIsDefaultTrue();

    boolean existsByNameIgnoreCase(String name);
}
