package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.SiteEmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteEmailTemplateRepository extends JpaRepository<SiteEmailTemplate, Long> {
    List<SiteEmailTemplate> findBySiteId(Long siteId);
    Optional<SiteEmailTemplate> findFirstBySiteIdAndTriggerEventAndActiveTrue(Long siteId, String triggerEvent);
}
