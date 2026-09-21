-- V15: Garantir delecao em cascata para empresas e seus relacionamentos
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_company_id_fkey;
ALTER TABLE proposals ADD CONSTRAINT proposals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_company_id_fkey;
ALTER TABLE contracts ADD CONSTRAINT contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE company_agreements DROP CONSTRAINT IF EXISTS company_agreements_company_id_fkey;
ALTER TABLE company_agreements ADD CONSTRAINT company_agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
