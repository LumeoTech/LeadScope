package com.crmscanner.scanner.repository;

import com.crmscanner.scanner.entity.ScannerJobItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScannerJobItemRepository extends JpaRepository<ScannerJobItem, Long> {

    Page<ScannerJobItem> findByJobId(Long jobId, Pageable pageable);

    List<ScannerJobItem> findByJobIdAndStatus(Long jobId, String status);

    Optional<ScannerJobItem> findByJobIdAndCnpj(Long jobId, String cnpj);

    long countByJobIdAndStatus(Long jobId, String status);
}
