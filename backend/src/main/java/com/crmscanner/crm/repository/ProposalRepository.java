package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByLeadIdOrderByCreatedAtDesc(Long leadId);

    List<Proposal> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Page<Proposal> findByStatus(String status, Pageable pageable);
}
