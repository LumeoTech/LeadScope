import React, { useEffect, useState } from 'react';
import { api, AuditLog } from '../services/api';
import { ShieldCheck, User, Globe, Clock, Activity } from 'lucide-react';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.audit.list();
      setLogs(res.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px' }}>Auditoria & Rastreabilidade</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Log em tempo real de todas as operações, alterações e acessos</p>
        </div>
        <button onClick={loadLogs} className="btn btn-secondary btn-sm">
          <span>Atualizar Logs</span>
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px 20px' }}>AÇÃO</th>
              <th style={{ padding: '16px 20px' }}>ENTIDADE</th>
              <th style={{ padding: '16px 20px' }}>DESCRIÇÃO</th>
              <th style={{ padding: '16px 20px' }}>ORIGEM / IP</th>
              <th style={{ padding: '16px 20px' }}>DATA / HORA</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum log de auditoria registrado até o momento.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${
                      log.action === 'CREATE' ? 'badge-success' :
                      log.action === 'STATUS_CHANGE' || log.action === 'ASSIGN' ? 'badge-primary' :
                      log.action === 'UPDATE' ? 'badge-info' : 'badge-danger'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                    {log.entityType} #{log.entityId}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>
                    {log.description}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
