import React, { useEffect, useState } from 'react';
import { api, Company, Contract, UserInfo } from '../services/api';
import { permissionsService } from '../services/permissionsService';
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
  X,
  MoreHorizontal,
  Eye,
  FileText,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { ContractModal } from '../components/ContractModal';

export const CompaniesView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState<'ALL' | 'CLIENTS' | 'PROSPECTS'>('ALL');
  const [selectedCompanyForContract, setSelectedCompanyForContract] = useState<Company | null>(null);
  const [companyContracts, setCompanyContracts] = useState<Record<string, Contract>>({});

  // Menu Dropdown ativo por ID da empresa
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Modal Ver Detalhes da Empresa
  const [companyToView, setCompanyToView] = useState<Company | null>(null);

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

  // Toast / Feedback em tela (sem alert feio do navegador)
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Re-render when permissions update
  const [, setPermissionsTick] = useState(0);
  useEffect(() => {
    const handlePermChange = () => setPermissionsTick(t => t + 1);
    window.addEventListener('lumeo_permissions_changed', handlePermChange);
    return () => window.removeEventListener('lumeo_permissions_changed', handlePermChange);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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
    } catch (e: any) {
      showToast('Erro ao carregar empresas: ' + (e.message || 'Falha de conexão'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Permissões dinâmicas
  const userRole = currentUser?.role || 'VENDEDOR';
  const canCreate = permissionsService.hasPermission(userRole, 'can_create_companies');
  const canEdit = permissionsService.hasPermission(userRole, 'can_edit_companies');
  const canDelete = permissionsService.hasPermission(userRole, 'can_delete_companies');
  const canExport = permissionsService.hasPermission(userRole, 'can_export_data');

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
      showToast('Empresa cadastrada com sucesso!', 'success');
      loadCompanies();
    } catch (e: any) {
      showToast(e.message || 'Erro ao cadastrar empresa', 'error');
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
      showToast('Empresa atualizada com sucesso!', 'success');
      loadCompanies();
    } catch (e: any) {
      showToast(e.message || 'Erro ao atualizar empresa', 'error');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setDeleting(true);
    try {
      await api.companies.delete(companyToDelete.id);
      showToast(`Empresa "${companyToDelete.razaoSocial}" excluída com sucesso!`, 'success');
      setCompanyToDelete(null);
      loadCompanies();
    } catch (e: any) {
      showToast('Erro ao excluir empresa: ' + (e.message || 'Erro desconhecido'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (companies.length === 0) {
      showToast('Nenhuma empresa para exportar.', 'error');
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
    link.setAttribute('download', `leadscope_empresas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exportação concluída!', 'success');
  };

  const filteredCompanies = companies.filter(c => {
    if (filterClient === 'CLIENTS') return c.isClient;
    if (filterClient === 'PROSPECTS') return !c.isClient;
    return true;
  });

  return (
    <div>
      {/* Toast Notification */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '10px',
            background: feedback.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
            fontSize: '0.88rem',
            fontWeight: '500',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#f87171" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
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

          {canExport && (
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
          )}

          {canCreate && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} />
              <span>+ Nova Empresa</span>
            </button>
          )}
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
      <div className="glass-panel" style={{ overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 18px' }}>EMPRESA</th>
              <th style={{ padding: '14px 18px' }}>CNPJ</th>
              <th style={{ padding: '14px 18px' }}>STATUS</th>
              <th style={{ padding: '14px 18px' }}>CONTRATO DIGITAL</th>
              <th style={{ padding: '14px 18px' }}>SEGMENTO</th>
              <th style={{ padding: '14px 18px' }}>CIDADE / UF</th>
              <th style={{ padding: '14px 18px', textAlign: 'center', width: '80px' }}>AÇÕES</th>
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
                const isMenuOpen = openMenuId === comp.id;

                return (
                  <tr key={comp.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div
                        onClick={() => setCompanyToView(comp)}
                        style={{ fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title="Ver detalhes da empresa"
                      >
                        <span>{comp.razaoSocial}</span>
                      </div>
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

                    {/* Menu de Três Pontinhos */}
                    <td style={{ padding: '14px 18px', textAlign: 'center', position: 'relative' }}>
                      <div className="dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : comp.id);
                          }}
                          style={{
                            background: isMenuOpen ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: isMenuOpen ? '#ffffff' : 'var(--text-muted)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          title="Ações da empresa"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Floating Menu Dropdown */}
                        {isMenuOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 'calc(100% + 6px)',
                              background: '#16171b',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '10px',
                              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.65)',
                              minWidth: '185px',
                              zIndex: 1000,
                              padding: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. Ver empresa */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setCompanyToView(comp);
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: '0.82rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Eye size={15} color="#60a5fa" />
                              <span>Ver empresa</span>
                            </button>

                            {/* 2. Editar */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleOpenEdit(comp);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#e5e7eb',
                                  fontSize: '0.82rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Edit2 size={15} color="#fbbf24" />
                                <span>Editar</span>
                              </button>
                            )}

                            {/* 3. Enviar contrato */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedCompanyForContract(comp);
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#e5e7eb',
                                fontSize: '0.82rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <FileSignature size={15} color="var(--accent-coral)" />
                              <span>{contract ? 'Gerenciar contrato' : 'Enviar contrato'}</span>
                            </button>

                            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

                            {/* 4. Excluir */}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setCompanyToDelete(comp);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#f87171',
                                  fontSize: '0.82rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Trash2 size={15} color="#f87171" />
                                <span>Excluir</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Ver Detalhes da Empresa */}
      {companyToView && (
        <div className="modal-overlay" onClick={() => setCompanyToView(null)}>
          <div className="modal-content" style={{ maxWidth: '640px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    {companyToView.razaoSocial}
                  </h2>
                  {companyToView.nomeFantasia && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {companyToView.nomeFantasia}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCompanyToView(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Badges Principais */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
              {companyToView.isClient ? (
                <span className="badge badge-success">
                  <CheckCircle size={12} />
                  <span>Cliente Ativo</span>
                </span>
              ) : (
                <span className="badge badge-warning">
                  <Clock size={12} />
                  <span>Prospect em Prospecção</span>
                </span>
              )}

              <span className="badge badge-primary">
                {companyToView.segmento || 'Segmento Geral'}
              </span>

              <span className="badge badge-secondary">
                Porte: {companyToView.porte || 'EPP'}
              </span>
            </div>

            {/* Dados Cadastrais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-hover)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>CNPJ</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontWeight: '600', fontFamily: 'monospace', color: 'var(--accent-coral)' }}>
                  {companyToView.cnpj || 'Não informado'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Localização</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {companyToView.cidade ? `${companyToView.cidade} - ${companyToView.estado}` : 'Não informada'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Telefone / WhatsApp</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {companyToView.telefone || 'Não informado'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>E-mail Comercial</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {companyToView.email || 'Não informado'}
                </p>
              </div>
            </div>

            {/* Contrato Digital */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSignature size={18} color="var(--accent-coral)" />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Status do Contrato Digital</span>
                </div>
                {companyContracts[companyToView.id] ? (
                  <span className={`badge ${companyContracts[companyToView.id].status === 'SIGNED' ? 'badge-success' : 'badge-warning'}`}>
                    {companyContracts[companyToView.id].status === 'SIGNED' ? 'Assinado' : 'Pendente de Assinatura'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhum contrato enviado</span>
                )}
              </div>
            </div>

            {/* Botões do Rodapé do Modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const target = companyToView;
                  setCompanyToView(null);
                  setSelectedCompanyForContract(target);
                }}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileSignature size={15} />
                <span>Gerenciar Contrato</span>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const target = companyToView;
                    setCompanyToView(null);
                    handleOpenEdit(target);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={15} />
                  <span>Editar Empresa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Nova Empresa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-overlay" onClick={() => setCompanyToEdit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-overlay" onClick={() => setCompanyToDelete(null)}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
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

      {/* Modal de Envio e Gestão de Contrato Digital */}
      {selectedCompanyForContract && (
        <ContractModal
          isOpen={Boolean(selectedCompanyForContract)}
          company={selectedCompanyForContract}
          onClose={() => {
            setSelectedCompanyForContract(null);
            loadCompanies();
          }}
          onContractSent={() => {
            loadCompanies();
            showToast('Contrato digital enviado com sucesso!', 'success');
          }}
        />
      )}
    </div>
  );
};
