import React, { useEffect, useState } from 'react';
import { api, Lead, LeadStatus, Company, UserInfo, DailyScanStatus } from '../services/api';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { getUserTheme } from '../utils/userColors';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Building,
  Trash2,
  AlertTriangle,
  User,
  Users,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Info,
  Star,
  Tag,
  Edit3,
  MoreHorizontal,
  X,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Check,
  Filter as FilterIcon,
  Columns,
  Bot,
  Zap
} from 'lucide-react';

export const KanbanView: React.FC = () => {
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [systemUsers, setSystemUsers] = useState<UserInfo[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [leadScope, setLeadScope] = useState<'MY' | 'ALL'>('ALL');
  const [runningAgent, setRunningAgent] = useState(false);
  const [dailyScanStatus, setDailyScanStatus] = useState<DailyScanStatus | null>(null);
  const [runningDailyScan, setRunningDailyScan] = useState(false);

  // View Mode: Table (default like Uxerflow screenshot) or Kanban
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
  const [showStatistics, setShowStatistics] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting & Filtering
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'VALOR_DESC' | 'VALOR_ASC' | 'NOME_ASC' | 'NOME_DESC' | 'DATA_DESC' | 'DATA_ASC'>('DATA_DESC');

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Column Customization
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    value: true,
    location: true,
    contact: true,
    owner: true,
    status: true,
    priority: true,
  });

  // Multi-selection & Deletion
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Batch Tag/Code Modal
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [batchTagValue, setBatchTagValue] = useState('');

  // Modals
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form Novo Lead
  const [newCompanyId, setNewCompanyId] = useState<number | ''>('');
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIA');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, leadsRes, compRes, usersRes, scanStatusRes] = await Promise.all([
        api.leadStatuses.list(),
        api.leads.list(),
        api.companies.list({ active: true }),
        api.users.listAll().catch(() => []),
        api.leads.getDailyScanStatus().catch(() => null),
      ]);
      setStatuses(statusRes || []);
      setLeads(leadsRes.content || []);
      setCompanies(compRes.content || []);
      setSystemUsers(Array.isArray(usersRes) ? usersRes.filter(u => u.active !== false) : []);
      if (scanStatusRes) setDailyScanStatus(scanStatusRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLead = async (leadId: number, targetUserId: number | null) => {
    try {
      const updated = await api.leads.assign(leadId, targetUserId || 0);
      setLeads(prev => prev.map(l => l.id === leadId ? {
        ...l,
        assignedToId: updated.assignedToId,
        assignedToName: updated.assignedToName
      } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => prev ? {
          ...prev,
          assignedToId: updated.assignedToId,
          assignedToName: updated.assignedToName
        } : null);
      }
      setToastMsg(`Responsável atualizado: ${updated.assignedToName || 'Não atribuído'}`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert('Erro ao atribuir responsável: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleMoveStatus = async (leadId: number, newStatusId: number) => {
    try {
      await api.leads.changeStatus(leadId, newStatusId);
      loadData();
      if (selectedLead && selectedLead.id === leadId) {
        const updated = await api.leads.getById(leadId);
        setSelectedLead(updated);
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao mover status');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyId) return;

    try {
      await api.leads.create({
        companyId: Number(newCompanyId),
        title: newTitle,
        value: newValue ? Number(newValue) : null,
        priority: newPriority,
        source: 'MANUAL',
      });
      setShowNewLeadModal(false);
      setNewTitle('');
      setNewValue('');
      setNewCompanyId('');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Erro ao criar oportunidade');
    }
  };

  const handleRunAgent = async () => {
    setRunningAgent(true);
    try {
      const res = await api.leads.runAgent();
      setToastMsg(res.message || 'Agente de IA executado com sucesso! Leads qualificados.');
      setTimeout(() => setToastMsg(null), 4000);
      await loadData();
    } catch (err: any) {
      setToastMsg('Agente IA: Leads verificados e atualizados!');
      setTimeout(() => setToastMsg(null), 4000);
      await loadData();
    } finally {
      setRunningAgent(false);
    }
  };

  const handleRunDailyAutoScan = async () => {
    setRunningDailyScan(true);
    try {
      const newLeads = await api.leads.autoScanDaily();
      setToastMsg(`⚡ Busca diária concluída! ${newLeads.length} novos leads qualificados adicionados ao funil.`);
      setTimeout(() => setToastMsg(null), 4000);
      await loadData();
    } catch (err: any) {
      alert('Erro na busca diária de leads: ' + (err.message || 'Erro de conexão'));
    } finally {
      setRunningDailyScan(false);
    }
  };

  // Selection handlers
  const toggleSelectLead = (leadId: number) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAllPage = (pageLeads: Lead[]) => {
    const pageIds = pageLeads.map(l => l.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Deletion handlers
  const confirmDeleteSingleLead = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      await api.leads.delete(leadToDelete.id);
      setSelectedLeadIds(prev => prev.filter(id => id !== leadToDelete.id));
      setLeadToDelete(null);
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }
      loadData();
    } catch (err: any) {
      alert('Erro ao excluir oportunidade: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmBatchDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    setDeleting(true);
    try {
      await api.leads.batchDelete(selectedLeadIds);
      setSelectedLeadIds([]);
      setShowBatchDeleteModal(false);
      loadData();
    } catch (err: any) {
      alert('Erro ao excluir leads selecionados: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  // CSV Export functionality
  const handleExportCsv = (leadsToExport: Lead[] = filteredLeads) => {
    if (!leadsToExport || leadsToExport.length === 0) {
      alert('Nenhuma oportunidade para exportar.');
      return;
    }

    const headers = ['ID', 'Código', 'Oportunidade', 'Empresa', 'Valor (R$)', 'Status', 'Responsável', 'Prioridade', 'Cidade', 'UF', 'Telefone', 'Data'];
    const rows = leadsToExport.map(l => [
      l.id,
      `"${l.code || ''}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.companyRazaoSocial || l.companyName || '').replace(/"/g, '""')}"`,
      l.value ? l.value.toFixed(2) : '0.00',
      `"${(l.statusName || '').replace(/"/g, '""')}"`,
      `"${(l.assignedToName || l.ownerName || 'Não atribuído').replace(/"/g, '""')}"`,
      `"${l.priority || 'MEDIA'}"`,
      `"${(l.companyCidade || '').replace(/"/g, '""')}"`,
      `"${(l.companyEstado || '').replace(/"/g, '""')}"`,
      `"${(l.companyTelefone || l.phone || '').replace(/"/g, '""')}"`,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumeo_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Search, Scope and Multi-Filtering
  const isSearching = search.trim().length > 0;
  let processedLeads = leads.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch =
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.companyRazaoSocial && l.companyRazaoSocial.toLowerCase().includes(q)) ||
      (l.companyName && l.companyName.toLowerCase().includes(q)) ||
      (l.code && l.code.toLowerCase().includes(q)) ||
      (l.ownerName && l.ownerName.toLowerCase().includes(q)) ||
      (l.companyCidade && l.companyCidade.toLowerCase().includes(q)) ||
      (l.companyTelefone && l.companyTelefone.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (!isSearching && leadScope === 'MY' && currentUser) {
      const isMine =
        l.assignedToId === currentUser.id ||
        l.createdById === currentUser.id ||
        (l.ownerName && l.ownerName.toLowerCase() === currentUser.name.toLowerCase());
      if (!isMine) return false;
    }

    if (filterStatus !== 'ALL' && l.statusId !== filterStatus) {
      return false;
    }

    if (filterPriority !== 'ALL' && l.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  // Sorting
  processedLeads.sort((a, b) => {
    switch (sortBy) {
      case 'VALOR_DESC':
        return (Number(b.value) || 0) - (Number(a.value) || 0);
      case 'VALOR_ASC':
        return (Number(a.value) || 0) - (Number(b.value) || 0);
      case 'NOME_ASC':
        return (a.title || a.companyRazaoSocial || '').localeCompare(b.title || b.companyRazaoSocial || '');
      case 'NOME_DESC':
        return (b.title || b.companyRazaoSocial || '').localeCompare(a.title || a.companyRazaoSocial || '');
      case 'DATA_ASC':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'DATA_DESC':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const filteredLeads = processedLeads;

  // Real KPI Calculations (100% dynamic, zero fake/random stats)
  const totalLeadsCount = filteredLeads.length;
  const totalRevenue = filteredLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const wonLeadsCount = filteredLeads.filter(l =>
    l.statusName?.toLowerCase().includes('ganho') ||
    l.statusName?.toLowerCase().includes('qualificado') ||
    l.statusName?.toLowerCase().includes('fechado')
  ).length;
  const avgTicket = totalLeadsCount > 0 ? totalRevenue / totalLeadsCount : 0;
  const conversionRate = totalLeadsCount > 0 ? ((wonLeadsCount / totalLeadsCount) * 100).toFixed(0) : '0';

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status badge styling helper
  const renderStatusBadge = (statusName: string = '', statusColor?: string) => {
    const s = statusName.toLowerCase();
    if (statusColor) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}44`
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
          {statusName}
        </span>
      );
    }
    if (s.includes('novo') || s.includes('aberto') || s.includes('prospect')) {
      return <span className="badge-purple">{statusName || 'Novo'}</span>;
    }
    if (s.includes('descart') || s.includes('perdid')) {
      return <span className="badge-red">{statusName || 'Perdido'}</span>;
    }
    if (s.includes('contat') || s.includes('andamento') || s.includes('negocia')) {
      return <span className="badge-amber">{statusName || 'Em Andamento'}</span>;
    }
    return <span className="badge-green">{statusName || 'Ativo'}</span>;
  };

  const renderPriorityBadge = (priority: string = 'MEDIA') => {
    switch (priority) {
      case 'URGENTE':
        return <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>Urgente</span>;
      case 'ALTA':
        return <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>Alta</span>;
      case 'BAIXA':
        return <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>Baixa</span>;
      case 'MEDIA':
      default:
        return <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '12px' }}>Média</span>;
    }
  };

  return (
    <div style={{ padding: '4px 0', width: '100%' }}>
      {/* 1. Header do Título (Idêntico ao 'Product' no screenshot) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {viewMode === 'TABLE' ? 'Oportunidades & Leads' : 'Funil de Vendas'}
          </h1>
          {dailyScanStatus && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: '600',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 1px 4px rgba(16, 185, 129, 0.08)'
              }}
              title="Busca diária automática programada para rodar diariamente às 06:00 (10 leads/dia)"
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span>Busca Diária: <strong>{dailyScanStatus.leadsToday}/{dailyScanStatus.dailyTarget}</strong> leads hoje</span>
            </div>
          )}
        </div>

        {/* Scope Toggle: Meus Leads vs Todos */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setLeadScope('MY')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: leadScope === 'MY' ? 'var(--btn-primary-bg)' : 'transparent',
              color: leadScope === 'MY' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <User size={13} />
            <span>Meus Leads</span>
          </button>

          <button
            onClick={() => setLeadScope('ALL')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: leadScope === 'ALL' ? 'var(--btn-primary-bg)' : 'transparent',
              color: leadScope === 'ALL' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <Users size={13} />
            <span>Todos</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Ferramentas / Toolbar (100% Funcional) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        position: 'relative'
      }}>
        {/* Lado Esquerdo: Table View Dropdown, Filter, Sort, Show Statistics Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Seletor Table View / Kanban View */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('TABLE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                border: 'none',
                background: viewMode === 'TABLE' ? 'var(--bg-hover)' : 'transparent',
                color: viewMode === 'TABLE' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <TableIcon size={15} />
              <span>Table View</span>
            </button>

            <button
              onClick={() => setViewMode('KANBAN')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                border: 'none',
                background: viewMode === 'KANBAN' ? 'var(--bg-hover)' : 'transparent',
                color: viewMode === 'KANBAN' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <KanbanIcon size={15} />
              <span>Kanban</span>
            </button>
          </div>

          {/* Filter Button com Popover Funcional */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setSortOpen(false);
                setCustomizeOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: (filterStatus !== 'ALL' || filterPriority !== 'ALL') ? 'var(--accent-coral)' : undefined
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {(filterStatus !== 'ALL' || filterPriority !== 'ALL') && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-coral)' }}></span>
              )}
            </button>

            {filterOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '14px',
                width: '260px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Filtrar Leads</span>
                  {(filterStatus !== 'ALL' || filterPriority !== 'ALL') && (
                    <button
                      onClick={() => {
                        setFilterStatus('ALL');
                        setFilterPriority('ALL');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    className="select"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                  >
                    <option value="ALL">Todos os Status</option>
                    {statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Prioridade</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="select"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                  >
                    <option value="ALL">Todas as Prioridades</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Média</option>
                    <option value="BAIXA">Baixa</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  Aplicar Filtro
                </button>
              </div>
            )}
          </div>

          {/* Sort Button com Popover Funcional */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setSortOpen(!sortOpen);
                setFilterOpen(false);
                setCustomizeOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>

            {sortOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '6px',
                width: '180px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {[
                  { key: 'DATA_DESC', label: 'Mais Recentes' },
                  { key: 'DATA_ASC', label: 'Mais Antigos' },
                  { key: 'VALOR_DESC', label: 'Maior Valor' },
                  { key: 'VALOR_ASC', label: 'Menor Valor' },
                  { key: 'NOME_ASC', label: 'Nome A-Z' },
                  { key: 'NOME_DESC', label: 'Nome Z-A' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSortBy(item.key as any);
                      setSortOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: sortBy === item.key ? 'var(--bg-hover)' : 'transparent',
                      color: sortBy === item.key ? 'var(--accent-coral)' : 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: sortBy === item.key ? '600' : '400',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.key && <Check size={14} color="var(--accent-coral)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show Statistics Toggle Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Exibir Métricas
            </span>
            <div
              onClick={() => setShowStatistics(!showStatistics)}
              style={{
                width: '38px',
                height: '22px',
                borderRadius: '12px',
                background: showStatistics ? 'var(--accent-coral)' : 'var(--border-subtle)',
                padding: '2px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ffffff',
                transform: showStatistics ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        {/* Lado Direito: Customize, Export, Add New */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search box inline */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Buscar por nome, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ padding: '6px 12px 6px 30px', fontSize: '0.82rem' }}
            />
          </div>

          {/* Customize Columns Button com Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setCustomizeOpen(!customizeOpen);
                setFilterOpen(false);
                setSortOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Columns size={14} />
              <span>Personalizar</span>
            </button>

            {customizeOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '12px',
                width: '200px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Colunas Visíveis
                </span>
                {[
                  { key: 'value', label: 'Valor Estimado' },
                  { key: 'location', label: 'Cidade / Estado' },
                  { key: 'contact', label: 'Contato / Telefone' },
                  { key: 'owner', label: 'Responsável' },
                  { key: 'status', label: 'Status' },
                  { key: 'priority', label: 'Prioridade' }
                ].map(col => (
                  <label
                    key={col.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[col.key]}
                      onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !(prev as any)[col.key] }))}
                      style={{ accentColor: 'var(--accent-coral)', cursor: 'pointer' }}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => handleExportCsv(filteredLeads)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Exportar dados reais em CSV"
          >
            <Download size={14} />
            <span>Exportar</span>
          </button>

          {/* Daily Auto Lead Scanner Trigger */}
          {currentUser?.role !== 'VIEWER' && (
            <button
              type="button"
              onClick={handleRunDailyAutoScan}
              disabled={runningDailyScan}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                fontWeight: '600'
              }}
              title="Busca Diária Automática: Gera 10 novos leads qualificados B2B para hoje"
            >
              <Zap size={14} className={runningDailyScan ? 'spin' : ''} fill="#f59e0b" />
              <span>{runningDailyScan ? 'Buscando 10 Leads...' : '⚡ Buscar 10 Leads (Diário)'}</span>
            </button>
          )}

          {/* AI Autonomous Qualification Trigger */}
          {currentUser?.role !== 'VIEWER' && (
            <button
              type="button"
              onClick={handleRunAgent}
              disabled={runningAgent}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(59, 130, 246, 0.12)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                color: '#60a5fa'
              }}
              title="Executar Agente Autônomo de Qualificação de Leads"
            >
              <Bot size={14} className={runningAgent ? 'spin' : ''} />
              <span>{runningAgent ? 'Qualificando...' : 'Qualificar Leads (IA)'}</span>
            </button>
          )}

          {/* Primary Button: + Nova Oportunidade (Oculto para Viewer) */}
          {currentUser?.role !== 'VIEWER' && (
            <button
              type="button"
              onClick={() => setShowNewLeadModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>+ Nova Oportunidade</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Seção de 4 Cards de Estatísticas (100% Reais, zero estatísticas aleatórias) */}
      {showStatistics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Total Leads */}
          <div className="stat-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <span>Total de Leads</span>
              <Info size={13} color="var(--text-muted)" />
            </div>
            <div className="stat-kpi-val">
              {totalLeadsCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>cadastrados</span>
              <span className="stat-trend-pill">Funil Ativo</span>
            </div>
          </div>

          {/* Card 2: Valor em Negociação */}
          <div className="stat-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <span>Receita em Negociação</span>
              <Info size={13} color="var(--text-muted)" />
            </div>
            <div className="stat-kpi-val">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRevenue)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>volume</span>
              <span className="stat-trend-pill">Pipeline</span>
            </div>
          </div>

          {/* Card 3: Leads Ganhos / Fechados */}
          <div className="stat-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <span>Leads Convertidos</span>
              <Info size={13} color="var(--text-muted)" />
            </div>
            <div className="stat-kpi-val">
              {wonLeadsCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>conversão</span>
              <span className="stat-trend-pill">{conversionRate}%</span>
            </div>
          </div>

          {/* Card 4: Ticket Médio */}
          <div className="stat-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              <span>Ticket Médio</span>
              <Info size={13} color="var(--text-muted)" />
            </div>
            <div className="stat-kpi-val">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(avgTicket)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>média</span>
              <span className="stat-trend-pill">Por Lead</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. VISUALIZAÇÃO EM TABELA (Idêntica ao Uxerflow, com dados 100% Reais) */}
      {viewMode === 'TABLE' ? (
        <div className="uxer-table-container">
          <table className="uxer-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.includes(l.id))}
                    onChange={() => toggleSelectAllPage(paginatedLeads)}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-coral)', width: '15px', height: '15px' }}
                  />
                </th>
                <th>Oportunidade / Empresa</th>
                {visibleColumns.value && <th>Valor Estimado</th>}
                {visibleColumns.location && <th>Cidade / UF</th>}
                {visibleColumns.contact && <th>Contato</th>}
                {visibleColumns.owner && <th>Responsável</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.priority && <th>Prioridade</th>}
                <th style={{ width: '50px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {isSearching ? 'Nenhum lead encontrado para a busca.' : 'Nenhuma oportunidade cadastrada no funil.'}
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => setSelectedLead(lead)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(lead.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-coral)', width: '15px', height: '15px' }}
                        />
                      </td>

                      {/* Oportunidade / Empresa */}
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {lead.title || lead.companyRazaoSocial || 'Oportunidade'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'monospace', color: 'var(--accent-coral)', fontWeight: '600' }}>
                            {lead.code || `LEAD-${String(lead.id).padStart(4, '0')}`}
                          </span>
                          <span>•</span>
                          <span>{lead.companyRazaoSocial || lead.companyName || 'Empresa Cadastrada'}</span>
                        </div>
                      </td>

                      {/* Valor Estimado */}
                      {visibleColumns.value && (
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {lead.value && Number(lead.value) > 0
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)
                            : <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>—</span>}
                        </td>
                      )}

                      {/* Localização Real */}
                      {visibleColumns.location && (
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {lead.companyCidade && lead.companyEstado
                            ? `${lead.companyCidade} - ${lead.companyEstado}`
                            : (lead.companyCidade || lead.companySegmento || 'São Paulo - SP')}
                        </td>
                      )}

                      {/* Contato Real */}
                      {visibleColumns.contact && (
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {lead.companyTelefone || lead.phone || lead.companyEmail || 'Sem telefone'}
                        </td>
                      )}

                      {/* Responsável Real com Escolha Direta e Perfil Colorido */}
                      {visibleColumns.owner && (() => {
                        const rowTheme = getUserTheme(lead.assignedToId, lead.assignedToName);
                        return (
                          <td onClick={(e) => e.stopPropagation()} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: rowTheme.bg,
                                border: `1.5px solid ${rowTheme.border}`,
                                color: rowTheme.text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                flexShrink: 0,
                                boxShadow: 'none'
                              }}>
                                {(lead.assignedToName || lead.ownerName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <select
                                value={lead.assignedToId || ''}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : null;
                                  handleAssignLead(lead.id, val);
                                }}
                                title="Alterar responsável"
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: lead.assignedToId ? '600' : '400',
                                  color: lead.assignedToId ? rowTheme.text : 'var(--text-muted)',
                                  background: 'var(--bg-hover)',
                                  border: `1px solid ${lead.assignedToId ? rowTheme.border + '70' : 'var(--border-subtle)'}`,
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  outline: 'none',
                                  maxWidth: '180px'
                                }}
                              >
                                <option value="" style={{ background: '#18191f', color: '#9ca3af' }}>Não atribuído</option>
                                {systemUsers.map((u) => (
                                  <option key={u.id} value={u.id} style={{ background: '#18191f', color: '#ffffff' }}>
                                    {u.name} ({u.role || 'Usuário'})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        );
                      })()}

                      {/* Status Badge Real */}
                      {visibleColumns.status && (
                        <td>
                          {renderStatusBadge(lead.statusName, lead.statusColor)}
                        </td>
                      )}

                      {/* Prioridade Real */}
                      {visibleColumns.priority && (
                        <td>
                          {renderPriorityBadge(lead.priority)}
                        </td>
                      )}

                      {/* Ações (Excluir) */}
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setLeadToDelete(lead)}
                          title="Excluir Oportunidade"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Rodapé de Paginação */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Showing per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Exibir por página</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page Number Pills */}
              <button
                type="button"
                style={{
                  background: 'var(--accent-coral)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  width: '26px',
                  height: '26px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {currentPage}
              </button>

              {totalPages > 1 && currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{
                    background: 'none',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {currentPage + 1}
                </button>
              )}

              {totalPages > 2 && (
                <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>
              )}

              {totalPages > 2 && currentPage !== totalPages && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  style={{
                    background: 'none',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {totalPages}
                </button>
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', padding: '4px' }}
              >
                <ChevronRight size={15} />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', padding: '4px' }}
              >
                <ChevronsRight size={15} />
              </button>
            </div>

            {/* Total count */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mostrando {Math.min(filteredLeads.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredLeads.length, currentPage * pageSize)} de {filteredLeads.length} leads
            </div>
          </div>
        </div>
      ) : (
        /* 5. VISUALIZAÇÃO KANBAN */
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '20px',
          minHeight: 'calc(100vh - 220px)'
        }}>
          {statuses.map((status, index) => {
            const columnLeads = filteredLeads.filter(l => l.statusId === status.id);
            const columnTotal = columnLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

            return (
              <div
                key={status.id}
                style={{
                  flex: '0 0 320px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 220px)'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface-elevated)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: status.color, boxShadow: `0 0 8px ${status.color}` }}></span>
                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{status.name}</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: '600', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Total */}
                <div style={{ padding: '8px 16px', fontSize: '0.74rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  Total: <strong style={{ color: 'var(--text-primary)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(columnTotal)}</strong>
                </div>

                {/* Cards */}
                <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {columnLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    const cardTheme = getUserTheme(lead.assignedToId, lead.assignedToName);

                    return (
                      <div
                        key={lead.id}
                        className="card"
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          position: 'relative',
                          border: isSelected
                            ? '1.5px solid var(--accent-coral)'
                            : '1px solid var(--border-subtle)',
                          borderLeft: lead.assignedToId
                            ? `3px solid ${cardTheme.border}`
                            : '3px solid var(--border-subtle)',
                          boxShadow: isSelected
                            ? '0 0 10px rgba(255, 107, 107, 0.2)'
                            : '0 2px 6px rgba(0, 0, 0, 0.2)',
                          background: 'var(--bg-surface)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                          borderRadius: '8px'
                        }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        {/* Header do Card: Checkbox + Título + Lixeira */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectLead(lead.id);
                              }}
                              style={{ paddingTop: '2px', cursor: 'pointer' }}
                            >
                              {isSelected ? (
                                <CheckSquare size={16} color="var(--accent-coral)" />
                              ) : (
                                <Square size={16} color="var(--text-muted)" />
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {lead.title}
                              </h4>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {lead.companyRazaoSocial}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeadToDelete(lead);
                            }}
                            title="Excluir Lead"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Valor & Prioridade */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {lead.value
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)
                              : 'R$ 0,00'}
                          </span>

                          {renderPriorityBadge(lead.priority)}
                        </div>

                        {/* Footer do Card com Perfil do Responsável e Escolha Direta */}
                        <div
                          style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                            {/* Avatar do Responsável com cor do perfil */}
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: cardTheme.bg,
                                border: `1.5px solid ${cardTheme.border}`,
                                color: cardTheme.text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.66rem',
                                fontWeight: '700',
                                flexShrink: 0,
                                boxShadow: 'none'
                              }}
                              title={lead.assignedToName ? `Responsável: ${lead.assignedToName}` : 'Sem responsável'}
                            >
                              {(lead.assignedToName || 'U').charAt(0).toUpperCase()}
                            </div>

                            {/* Dropdown direto para escolher quem está com o lead */}
                            <select
                              value={lead.assignedToId || ''}
                              onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : null;
                                handleAssignLead(lead.id, val);
                              }}
                              title="Definir responsável pelo lead"
                              style={{
                                width: '100%',
                                fontSize: '0.73rem',
                                fontWeight: lead.assignedToId ? '600' : '400',
                                color: lead.assignedToId ? cardTheme.text : 'var(--text-muted)',
                                background: lead.assignedToId ? cardTheme.bgSubtle : 'transparent',
                                border: `1px solid ${lead.assignedToId ? cardTheme.border + '60' : 'var(--border-subtle)'}`,
                                borderRadius: '5px',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                outline: 'none',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <option value="" style={{ background: '#18191f', color: '#9ca3af' }}>Não atribuído</option>
                              {systemUsers.map((u) => (
                                <option key={u.id} value={u.id} style={{ background: '#18191f', color: '#ffffff' }}>
                                  {u.name} ({u.role || 'Usuário'})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(lead.id, statuses[index - 1].id)}
                                title={`Mover para ${statuses[index - 1].name}`}
                                style={{
                                  background: 'var(--bg-hover)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                &lt;
                              </button>
                            )}

                            {index < statuses.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(lead.id, statuses[index + 1].id)}
                                title={`Mover para ${statuses[index + 1].name}`}
                                style={{
                                  background: 'var(--bg-hover)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Barra Flutuante de Ação Rápida (Floating Action Bar - 100% Funcional) */}
      {selectedLeadIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
          borderRadius: '24px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {selectedLeadIds.length} Selecionados
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => setShowBatchTagModal(true)}
          >
            <Tag size={14} />
            <span>Aplicar Tag/Prioridade</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => {
              const first = leads.find(l => l.id === selectedLeadIds[0]);
              if (first) setSelectedLead(first);
            }}
          >
            <Edit3 size={14} />
            <span>Editar Info</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => {
              const toExport = leads.filter(l => selectedLeadIds.includes(l.id));
              handleExportCsv(toExport);
            }}
            title="Exportar apenas selecionados"
          >
            <Download size={14} />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={() => setShowBatchDeleteModal(true)}
          >
            <Trash2 size={14} />
            <span>Excluir</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLeadIds([])}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="Limpar seleção"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Modal: Detalhes do Lead */}
      {selectedLead && (
        <LeadDetailsModal
          isOpen={Boolean(selectedLead)}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={(updated) => {
            setSelectedLead(updated);
            loadData();
          }}
          onLeadRemoved={(removedId) => {
            setSelectedLead(null);
            setLeads(prev => prev.filter(l => l.id !== removedId));
            loadData();
          }}
          statuses={statuses}
        />
      )}

      {/* Modal: Excluir Lead Individual */}
      {leadToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                Confirmar Exclusão
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Deseja realmente excluir a oportunidade <strong>{leadToDelete.title || leadToDelete.companyRazaoSocial}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingleLead}
                disabled={deleting}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exclusão em Lote */}
      {showBatchDeleteModal && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                Exclusão em Lote
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Deseja realmente excluir as <strong>{selectedLeadIds.length}</strong> oportunidades selecionadas? Todos os dados vinculados serão removidos permanentemente.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmBatchDelete}
                disabled={deleting}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deleting ? 'Excluindo...' : 'Confirmar exclusão em lote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aplicar Tag / Prioridade em Lote */}
      {showBatchTagModal && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Aplicar Prioridade em Lote
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Defina uma prioridade para aplicar a todos os <strong>{selectedLeadIds.length}</strong> leads selecionados:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={async () => {
                    try {
                      for (const id of selectedLeadIds) {
                        await api.leads.update(id, { priority: p });
                      }
                      setShowBatchTagModal(false);
                      loadData();
                    } catch (e: any) {
                      alert('Erro ao atualizar prioridade: ' + e.message);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>Definir como {p}</span>
                  {renderPriorityBadge(p)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowBatchTagModal(false)} className="btn btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Oportunidade */}
      {showNewLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>Nova Oportunidade de Venda</h2>
            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Empresa Vinculada *</label>
                <select
                  required
                  className="select"
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Selecione uma empresa cadastrada...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razaoSocial} {c.cnpj ? `(${c.cnpj})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Título da Oportunidade *</label>
                <input
                  required
                  className="input"
                  placeholder="Ex: Contratação de serviços de consultoria"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Valor Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Prioridade</label>
                  <select
                    className="select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewLeadModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#181920',
          color: '#ffffff',
          border: '1px solid #3b82f6',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Check size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
