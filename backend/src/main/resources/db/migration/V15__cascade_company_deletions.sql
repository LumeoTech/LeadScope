-- V15: Garantir delecao em cascata para empresas e seus relacionamentos
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_company_id_fkey;
ALTER TABLE proposals ADD CONSTRAINT proposals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_company_id_fkey;
ALTER TABLE contracts ADD CONSTRAINT contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agreements') THEN
        ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_company_id_fkey;
        ALTER TABLE agreements ADD CONSTRAINT agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;
