package com.crmscanner.crm.service;

import com.crmscanner.crm.dto.ContactRequest;
import com.crmscanner.crm.dto.ContactResponse;
import com.crmscanner.crm.entity.Company;
import com.crmscanner.crm.entity.Contact;
import com.crmscanner.crm.entity.Lead;
import com.crmscanner.crm.repository.ContactRepository;
import com.crmscanner.crm.repository.LeadRepository;
import com.crmscanner.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyService companyService;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> findByCompany(Long companyId) {
        return contactRepository.findByCompanyId(companyId).stream()
                .map(ContactResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> findByLead(Long leadId) {
        return contactRepository.findByLeadId(leadId).stream()
                .map(ContactResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContactResponse findById(Long id) {
        return ContactResponse.fromEntity(getContactEntity(id));
    }

    @Transactional
    public ContactResponse create(ContactRequest request) {
        Company company = companyService.getCompanyEntity(request.companyId());

        Lead lead = null;
        if (request.leadId() != null) {
            lead = leadRepository.findById(request.leadId()).orElse(null);
        }

        Contact contact = new Contact();
        contact.setCompany(company);
        contact.setLead(lead);
        contact.setName(request.name().trim());
        contact.setRole(request.role());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setWhatsapp(request.whatsapp());
        contact.setNotes(request.notes());

        return ContactResponse.fromEntity(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse update(Long id, ContactRequest request) {
        Contact contact = getContactEntity(id);

        contact.setName(request.name().trim());
        contact.setRole(request.role());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setWhatsapp(request.whatsapp());
        contact.setNotes(request.notes());

        if (request.leadId() != null) {
            Lead lead = leadRepository.findById(request.leadId()).orElse(null);
            contact.setLead(lead);
        }

        return ContactResponse.fromEntity(contactRepository.save(contact));
    }

    @Transactional
    public void delete(Long id) {
        Contact contact = getContactEntity(id);
        contactRepository.delete(contact);
    }

    private Contact getContactEntity(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contato", id));
    }
}
