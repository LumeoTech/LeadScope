package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findAllByOrderByCreatedAtDesc();

    List<Contract> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Contract> findByLeadIdOrderByCreatedAtDesc(Long leadId);

    Optional<Contract> findByDocusealSubmissionId(String submissionId);
}
