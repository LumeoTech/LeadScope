package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Agreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgreementRepository extends JpaRepository<Agreement, Long> {

    Optional<Agreement> findByToken(String token);

    List<Agreement> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Agreement> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
