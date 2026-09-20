CREATE TABLE IF NOT EXISTS contracts (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    docuseal_submission_id VARCHAR(100),
    template_name VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(200) NOT NULL,
    recipient_email VARCHAR(200) NOT NULL,
    recipient_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    document_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_lead_id ON contracts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
