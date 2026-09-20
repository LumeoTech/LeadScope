import React, { useEffect, useState } from 'react';
import { api, Company, Contract } from '../services/api';
import {
  Building2,
  Search,
  Plus,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  FileSignature,
  Download,
  Trash2,
  Edit2,
  AlertTriangle,
  X
} from 'lucide-react';
import { ContractModal } from '../components/ContractModal';

export const CompaniesView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState<'ALL' | 'CLIENTS' | 'PROSPECTS'>('ALL');
  const [selectedCompanyForContract, setSelectedCompanyForContract] = useState<Company | null>(null);
  const [companyContracts, setCompanyContracts] = useState<Record<string, Contract>>({});

  // Form Nova Empresa
  const [showModal, setShowModal] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [segmento, setSegmento] = useState('Tecnologia');
  const [porte, setPorte] = useState('EPP');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Edit Empresa
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [editRazaoSocial, setEditRazaoSocial] = useState('');
  const [editNomeFantasia, setEditNomeFantasia] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editSegmento, setEditSegmento] = useState('');
  const [editPorte, setEditPorte] = useState('');
  const [editCidade, setEditCidade] = useState('');
  const [editEstado, setEditEstado] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Delete Empresa
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, [search]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.companies.list({ search: search || undefined });
      const comps = res.content || [];
      setCompanies(comps);

      try {
        const allContracts = await api.contracts.list();
        const map: Record<string, Contract> = {};
        allContracts.forEach((c) => {
          if (c.companyId) {
            const curTime = c.createdAt || c.sentAt || '';
            const prevTime = map[c.companyId]?.createdAt || map[c.companyId]?.sentAt || '';
            if (!map[c.companyId] || new Date(curTime) > new Date(prevTime)) {
              map[c.companyId] = c;
            }
          }
        });
        setCompanyContracts(map);
      } catch (err) {
        console.warn('Contratos não puderam ser carregados:', err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.companies.create({
        razaoSocial,
        nomeFantasia,
        cnpj: cnpj || undefined,
        segmento,
        porte,
        cidade,
        estado,
        telefone,
        email,
        source: 'MANUAL'
      });
      setShowModal(false);
      setRazaoSocial('');
      setNomeFantasia('');
      setCnpj('');
      setCidade('');
      setTelefone('');
      setEmail('');
      loadCompanies();
    } catch (e: any) {
      alert(e.message || 'Erro ao cadastrar empresa');
    }
  };

  const handleOpenEdit = (comp: Company) => {
    setCompanyToEdit(comp);
    setEditRazaoSocial(comp.razaoSocial || '');
    setEditNomeFantasia(comp.nomeFantasia || '');
    setEditCnpj(comp.cnpj || '');
    setEditSegmento(comp.segmento || 'Tecnologia');
    setEditPorte(comp.porte || 'EPP');
    setEditCidade(comp.cidade || '');
    setEditEstado(comp.estado || 'SP');
    setEditTelefone(comp.telefone || '');
    setEditEmail(comp.email || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyToEdit) return;

    try {
      await api.companies.update(companyToEdit.id, {
        razaoSocial: editRazaoSocial,
        nomeFantasia: editNomeFantasia,
        cnpj: editCnpj || undefined,
        segmento: editSegmento,
        porte: editPorte,
        cidade: editCidade,
        estado: editEstado,
        telefone: editTelefone,
        email: editEmail
      });
      setCompanyToEdit(null);
      loadCompanies();
    } catch (e: any) {
      alert(e.message || 'Erro ao atualizar empresa');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setDeleting(true);
    try {
      await api.companies.delete(companyToDelete.id);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (e: any) {
      alert('Erro ao excluir empresa: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (companies.length === 0) {
      alert('Nenhuma empresa para exportar.');
      return;
    }

    const headers = ['ID', 'Razão Social', 'Nome Fantasia', 'CNPJ', 'Status', 'Segmento', 'Porte', 'Cidade', 'UF', 'Telefone', 'Email'];
    const rows = companies.map(c => [
      c.id,
      `"${(c.razaoSocial || '').replace(/"/g, '""')}"`,
      `"${(c.nomeFantasia || '').replace(/"/g, '""')}"`,
      `"${c.cnpj || ''}"`,
      c.isClient ? 'Cliente Ativo' : 'Prospect',
      `"${c.segmento || 'Geral'}"`,
      `"${c.porte || ''}"`,
      `"${c.cidade || ''}"`,
      `"${c.estado || ''}"`,
      `"${c.telefone || ''}"`,
      `"${c.email || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumeo_crm_empresas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredCompanies = companies.filter(c => {
    if (filterClient === 'CLIENTS') return c.isClient;
    if (filterClient === 'PROSPECTS') return !c.isClient;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)' }}>
            Empresas & Clientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Base central de organizações, prospecções e clientes ativos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '38px', fontSize: '0.82rem' }}
              placeholder="Buscar por nome, CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Exportar empresas em CSV"
          >
            <Download size={15} />
            <span>Exportar</span>
          </button>

          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>+ Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilterClient('ALL')}
          className={`btn btn-sm ${filterClient === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Todas ({companies.length})
        </button>
        <button
          onClick={() => setFilterClient('CLIENTS')}
          className={`btn btn-sm ${filterClient === 'CLIENTS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Clientes Ativos ({companies.filter(c => c.isClient).length})
        </button>
        <button
          onClick={() => setFilterClient('PROSPECTS')}
          className={`btn btn-sm ${filterClient === 'PROSPECTS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Prospects em Funil ({companies.filter(c => !c.isClient).length})
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 18px' }}>EMPRESA</th>
              <th style={{ padding: '14px 18px' }}>CNPJ</th>
              <th style={{ padding: '14px 18px' }}>STATUS</th>
              <th style={{ padding: '14px 18px' }}>CONTRATO DIGITAL</th>
              <th style={{ padding: '14px 18px' }}>SEGMENTO</th>
              <th style={{ padding: '14px 18px' }}>CIDADE / UF</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhuma empresa encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredCompanies.map(comp => {
                const contract = companyContracts[comp.id];
                return (
                  <tr key={comp.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{comp.razaoSocial}</div>
                      {comp.nomeFantasia && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{comp.nomeFantasia}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--accent-coral)', fontWeight: '600', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {comp.cnpj || '—'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {comp.isClient ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} />
                          <span>Cliente Ativo</span>
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={12} />
                          <span>Prospect</span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {contract ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge ${contract.status === 'SIGNED' ? 'badge-success' : contract.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                            {contract.status === 'SIGNED' ? 'Assinado' : contract.status === 'REJECTED' ? 'Recusado' : 'Pendente'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{contract.templateName}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nenhum enviado</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {comp.segmento || 'Geral'}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {comp.cidade ? `${comp.cidade} - ${comp.estado}` : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCompanyForContract(comp)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                          title="Gerenciar contrato digital"
                        >
                          <FileSignature size={14} color="var(--accent-coral)" />
                          <span>{contract ? 'Gerenciar Contrato' : 'Enviar Contrato'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(comp)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', color: 'var(--text-secondary)' }}
                          title="Editar dados da empresa"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCompanyToDelete(comp)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', color: 'var(--text-muted)' }}
                          title="Excluir empresa"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Contrato DocuSeal */}
      <ContractModal
        isOpen={!!selectedCompanyForContract}
        onClose={() => setSelectedCompanyForContract(null)}
        company={selectedCompanyForContract}
        onContractSent={(c) => {
          if (selectedCompanyForContract) {
            setCompanyContracts(prev => ({ ...prev, [selectedCompanyForContract.id]: c }));
          }
        }}
      />

      {/* Modal: Nova Empresa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '18px', color: 'var(--text-primary)' }}>Cadastrar Empresa</h2>
            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Razão Social *</label>
                <input
                  required
                  className="input"
                  placeholder="Nome oficial da empresa"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nome Fantasia</label>
                  <input
                    className="input"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>CNPJ</label>
                  <input
                    className="input"
                    placeholder="00.000.000/0001-99"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Segmento</label>
                  <input
                    className="input"
                    value={segmento}
                    onChange={(e) => setSegmento(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Porte</label>
                  <select className="select" value={porte} onChange={(e) => setPorte(e.target.value)}>
                    <option value="ME">Microempresa (ME)</option>
                    <option value="EPP">Empresa Pequeno Porte (EPP)</option>
                    <option value="MEDIO">Médio Porte</option>
                    <option value="GRANDE">Grande Porte</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Cidade</label>
                  <input
                    className="input"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Estado (UF)</label>
                  <input
                    className="input"
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Telefone</label>
                  <input
                    className="input"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>E-mail</label>
                  <input
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Empresa */}
      {companyToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '18px', color: 'var(--text-primary)' }}>Editar Empresa</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Razão Social *</label>
                <input
                  required
                  className="input"
                  value={editRazaoSocial}
                  onChange={(e) => setEditRazaoSocial(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nome Fantasia</label>
                  <input
                    className="input"
                    value={editNomeFantasia}
                    onChange={(e) => setEditNomeFantasia(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>CNPJ</label>
                  <input
                    className="input"
                    value={editCnpj}
                    onChange={(e) => setEditCnpj(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Segmento</label>
                  <input
                    className="input"
                    value={editSegmento}
                    onChange={(e) => setEditSegmento(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Porte</label>
                  <select className="select" value={editPorte} onChange={(e) => setEditPorte(e.target.value)}>
                    <option value="ME">Microempresa (ME)</option>
                    <option value="EPP">Empresa Pequeno Porte (EPP)</option>
                    <option value="MEDIO">Médio Porte</option>
                    <option value="GRANDE">Grande Porte</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Cidade</label>
                  <input
                    className="input"
                    value={editCidade}
                    onChange={(e) => setEditCidade(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Estado (UF)</label>
                  <input
                    className="input"
                    maxLength={2}
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Telefone</label>
                  <input
                    className="input"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>E-mail</label>
                  <input
                    className="input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setCompanyToEdit(null)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Atualizar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Empresa */}
      {companyToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Confirmar Exclusão</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Deseja realmente excluir a empresa <strong>{companyToDelete.razaoSocial}</strong>? Todas as oportunidades associadas serão afetadas.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
                disabled={deleting}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
