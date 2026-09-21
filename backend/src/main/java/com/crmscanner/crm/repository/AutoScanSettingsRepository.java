package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.AutoScanSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutoScanSettingsRepository extends JpaRepository<AutoScanSettings, Long> {
}
