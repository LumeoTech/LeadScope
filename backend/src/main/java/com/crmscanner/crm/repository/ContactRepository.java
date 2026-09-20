package com.crmscanner.crm.repository;

import com.crmscanner.crm.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByCompanyId(Long companyId);

    List<Contact> findByLeadId(Long leadId);
}
