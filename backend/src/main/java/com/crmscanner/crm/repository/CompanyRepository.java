package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCnpj(String cnpj);

    Optional<Company> findFirstByRazaoSocialIgnoreCase(String razaoSocial);

    boolean existsByCnpj(String cnpj);

    @Query("""
        SELECT c FROM Company c
        WHERE (:active IS NULL OR c.active = :active)
          AND (CAST(:search AS string) IS NULL OR LOWER(c.razaoSocial) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(c.nomeFantasia) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR c.cnpj LIKE CONCAT('%', CAST(:search AS string), '%'))
          AND (CAST(:estado AS string) IS NULL OR c.estado = CAST(:estado AS string))
          AND (CAST(:segmento AS string) IS NULL OR LOWER(c.segmento) = LOWER(CAST(:segmento AS string)))
    """)
    Page<Company> searchCompanies(
            @Param("search") String search,
            @Param("estado") String estado,
            @Param("segmento") String segmento,
            @Param("active") Boolean active,
            Pageable pageable
    );
}
