package com.crmscanner.scanner.repository;

import com.crmscanner.scanner.entity.ScannerJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScannerJobRepository extends JpaRepository<ScannerJob, Long> {

    Page<ScannerJob> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ScannerJob> findByStatus(String status);
}
