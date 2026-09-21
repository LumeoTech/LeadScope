import React, { useEffect, useState } from 'react';
import { api, Proposal, Lead, Contract } from '../services/api';
import { FileCheck2, DollarSign, Send, CheckCircle, XCircle, Plus, Calendar, Building, FileSignature, Trash2, AlertTriangle } from 'lucide-react';
import { ContractModal } from '../components/ContractModal';

export const ProposalsView: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposalForContract, setSelectedProposalForContract] = useState<Proposal | null>(null);
  const [proposalContracts, setProposalContracts] = useState<Record<number, Contract>>({});

  // Modal Exclusão Proposta
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal Nova Proposta
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, allProps] = await Promise.all([
        api.leads.list(),
        api.proposals.listAll().catch(() => []),
      ]);
      setLeads(leadsRes.content || []);
      setProposals(allProps || []);

      try {
        const contracts = await api.contracts.list();
        const map: Record<number, Contract> = {};
        contracts.forEach((c) => {
          if (c.proposalId) {
            const curTime = c.createdAt || c.sentAt || '';
            const prevTime = map[c.proposalId]?.createdAt || map[c.proposalId]?.sentAt || '';
            if (!map[c.proposalId] || new Date(curTime) > new Date(prevTime)) {
              map[c.proposalId] = c;
            }
          }
        });
        setProposalContracts(map);
      } catch (err) {
        console.warn('Contratos não puderam ser carregados:', err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !value) return;

    try {
      await api.proposals.create({
        leadId: Number(selectedLeadId),
        title,
        value: Number(value),
        validUntil: validUntil || undefined,
        notes,
      });
      setShowModal(false);
      setTitle('');
      setValue('');
      setValidUntil('');
      setNotes('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSend = async (id: number) => {
    try {
      await api.proposals.send(id);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await api.proposals.accept(id);
      alert('Proposta aceita com sucesso! A empresa foi convertida em Cliente e o lead foi movido para Fechado Ganho.');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.proposals.reject(id);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const confirmDeleteProposal = async () => {
    if (!proposalToDelete) return;
    setDeleting(true);
    try {
      await api.proposals.delete(proposalToDelete.id);
      setProposalToDelete(null);
      await loadData();
    } catch (e: any) {
      alert('Erro ao excluir proposta: ' + (e.message || 'Erro de conexão'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px' }}>Propostas Comerciais</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestão de orçamentos, emissão e conversão de contratos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Nova Proposta</span>
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px 20px' }}>PROPOSTA</th>
              <th style={{ padding: '16px 20px' }}>EMPRESA / LEAD</th>
              <th style={{ padding: '16px 20px' }}>VALOR</th>
              <th style={{ padding: '16px 20px' }}>STATUS</th>
              <th style={{ padding: '16px 20px' }}>CONTRATO DIGITAL</th>
              <th style={{ padding: '16px 20px' }}>VALIDADE</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhuma proposta comercial emitida ainda.
                </td>
              </tr>
            ) : (
              proposals.map(prop => (
                <tr key={prop.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{prop.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Emitida em {new Date(prop.createdAt).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600' }}>{prop.companyRazaoSocial}</div>
                    <div style={{ fontSize: '0.78rem', color: '#60a5fa' }}>{prop.leadTitle}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#34d399', fontSize: '1rem' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.value)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${
                      prop.status === 'ACCEPTED' ? 'badge-success' :
                      prop.status === 'SENT' ? 'badge-info' :
                      prop.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {proposalContracts[prop.id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${
                          proposalContracts[prop.id].status === 'SIGNED' ? 'badge-success' :
                          proposalContracts[prop.id].status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {proposalContracts[prop.id].status === 'SIGNED' ? '✓ Assinado' :
                           proposalContracts[prop.id].status === 'PENDING' ? '⏳ Pendente' : '✕ Recusado'}
                        </span>
                        <button
                          onClick={() => setSelectedProposalForContract(prop)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          title="Ver / Reenviar Contrato"
                        >
                          <FileSignature size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedProposalForContract(prop)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FileSignature size={13} />
                        <span>Enviar Contrato</span>
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {prop.validUntil ? new Date(prop.validUntil).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {prop.status === 'DRAFT' && (
                        <button onClick={() => handleSend(prop.id)} className="btn btn-secondary btn-sm" title="Marcar como Enviada">
                          <Send size={14} />
                          <span>Enviar</span>
                        </button>
                      )}
                      {prop.status !== 'ACCEPTED' && prop.status !== 'REJECTED' && (
                        <>
                          <button onClick={() => handleAccept(prop.id)} className="btn btn-success btn-sm" title="Aceitar e Converter em Cliente">
                            <CheckCircle size={14} />
                            <span>Aceitar</span>
                          </button>
                          <button onClick={() => handleReject(prop.id)} className="btn btn-danger btn-sm" title="Rejeitar">
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setProposalToDelete(prop)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', padding: '6px' }}
                        title="Excluir proposta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Confirmar Exclusão de Proposta */}
      {proposalToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                Excluir Proposta Comercial
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Deseja realmente excluir a proposta <strong>{proposalToDelete.title}</strong> no valor de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposalToDelete.value)}? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setProposalToDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteProposal}
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

      {/* Modal de Contrato DocuSeal */}
      <ContractModal
        isOpen={!!selectedProposalForContract}
        onClose={() => setSelectedProposalForContract(null)}
        proposal={selectedProposalForContract}
        onContractSent={(c) => {
          if (selectedProposalForContract) {
            setProposalContracts(prev => ({ ...prev, [selectedProposalForContract.id]: c }));
          }
        }}
      />

      {/* Modal: Nova Proposta */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '18px' }}>Elaborar Proposta Comercial</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Oportunidade / Lead *</label>
                <select
                  required
                  className="select"
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Selecione o lead vinculado...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.companyRazaoSocial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Título da Proposta *</label>
                <input
                  required
                  className="input"
                  placeholder="Ex: Proposta de Implementação de Software"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Valor Total (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="25000.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Validade da Proposta</label>
                  <input
                    type="date"
                    className="input"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Observações / Condições</label>
                <textarea
                  rows={3}
                  className="textarea"
                  placeholder="Condições de pagamento, prazos de entrega..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Gerar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
