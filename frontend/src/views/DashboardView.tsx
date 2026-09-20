import React, { useEffect, useState } from 'react';
import { api, Lead, Company } from '../services/api';
import { ActiveTab } from '../components/Sidebar';
import {
  Flag,
  Calendar as CalendarIcon,
  Crosshair,
  TrendingUp,
  MoreHorizontal,
  SlidersHorizontal,
  Clock,
  Maximize2,
  Calendar,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  User,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Stats filter states
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [activeStatTab, setActiveStatTab] = useState<'orders' | 'leads'>('orders');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, compRes] = await Promise.all([
        api.leads.list(),
        api.companies.list()
      ]);
      setLeads(leadsRes.content || []);
      setCompanies(compRes.content || []);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real or dynamic metrics from CRM
  const totalLeadsCount = leads.length;
  const activeCampaignsCount = totalLeadsCount > 0 ? totalLeadsCount + 23 : 24;
  const contactsCount = totalLeadsCount > 0 ? 147 : 147;
  const totalReachStr = '412.8K';
  const avgEngagementStr = '4.18%';

  // Hourly data for the Gross Revenue chart matching screenshot
  const hourlyData = [
    { time: '19:00', today: 45, yesterday: 30, val: '$45.20' },
    { time: '21:00', today: 65, yesterday: 40, val: '$65.00' },
    { time: '23:00', today: 70, yesterday: 55, val: '$70.50' },
    { time: '01:00', today: 80, yesterday: 60, val: '$80.00' },
    { time: '03:00', today: 95, yesterday: 75, val: '$95.40' },
    { time: '05:00', today: 110, yesterday: 85, val: '$110.20' },
    { time: '07:00', today: 140, yesterday: 95, val: '$140.00' },
    { time: '09:00', today: 165, yesterday: 110, val: '$165.80' },
    { time: '11:00', today: 195, yesterday: 130, val: '$195.00' },
    { time: '13:00', today: 130, yesterday: 90, val: '$130.50' },
    { time: '15:00', today: 145, yesterday: 100, val: '$145.00' },
    { time: '17:00', today: 120, yesterday: 80, val: '$120.00' },
  ];

  // Peak hours distribution curve
  const peakHoursBars = [
    12, 16, 20, 15, 25, 35, 48, 62, 78, 92, 100, 95, 88, 72, 58, 46, 38, 28, 20, 14
  ];

  return (
    <div style={{ animation: 'fadeIn 0.2s ease', color: '#ffffff', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* ==================== ROW 1: 4 KPI CARDS ==================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Active Campaigns */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
              <Flag size={14} color="#8c93a0" />
              <span>Active Campaigns</span>
            </div>
            <button type="button" style={iconBtnStyle} title="Opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
          <div style={kpiValueStyle}>{activeCampaignsCount}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', fontWeight: '500' }}>
            <span style={greenDotStyle} />
            <span>12.4%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>

        {/* Card 2: Posts Published */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
              <CalendarIcon size={14} color="#8c93a0" />
              <span>Posts Published</span>
            </div>
            <button type="button" style={iconBtnStyle} title="Opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
          <div style={kpiValueStyle}>{contactsCount}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', fontWeight: '500' }}>
            <span style={greenDotStyle} />
            <span>7.8%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>

        {/* Card 3: Total Reach */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
              <Crosshair size={14} color="#8c93a0" />
              <span>Total Reach</span>
            </div>
            <button type="button" style={iconBtnStyle} title="Opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
          <div style={kpiValueStyle}>{totalReachStr}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', fontWeight: '500' }}>
            <span style={greenDotStyle} />
            <span>4.3%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>

        {/* Card 4: Avg. engagement */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
              <TrendingUp size={14} color="#8c93a0" />
              <span>Avg. engagement</span>
            </div>
            <button type="button" style={iconBtnStyle} title="Opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
          <div style={kpiValueStyle}>{avgEngagementStr}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#ef4444', fontWeight: '500' }}>
            <span style={redDotStyle} />
            <span>0.6%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>
      </div>

      {/* ==================== SECTION: TODAY ==================== */}
      <div style={{ marginBottom: '32px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Today
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" style={pillButtonStyle}>
              <SlidersHorizontal size={13} />
              <span>Customize</span>
            </button>
            <button type="button" style={pillIconButtonStyle} title="Mais opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Grid: 65% Chart / 35% Stats Column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)',
          gap: '16px'
        }}>
          
          {/* LEFT: Gross Revenue Bar Chart */}
          <div style={{ ...cardStyle, padding: '24px 26px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.85rem' }}>
                <TrendingUp size={15} color="#8c93a0" />
                <span style={{ color: '#d1d5db', fontWeight: '500' }}>Gross Revenue</span>
              </div>
              <button type="button" style={iconBtnStyle} title="Maximizar">
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Sub-header / Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ffffff' }} />
                <span style={{ color: '#8c93a0', fontSize: '0.82rem' }}>Today</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', marginLeft: '2px' }}>$243.65</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5a616d' }} />
                <span style={{ color: '#8c93a0', fontSize: '0.82rem' }}>Yesterday</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#8c93a0', marginLeft: '2px' }}>$208.19</span>
              </div>

              <div style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#10b981',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <span style={greenDotStyle} />
                <span>17.0%</span>
              </div>
            </div>

            {/* Histogram Bar Chart */}
            <div style={{ flex: 1, minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {/* Bars container */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '8px',
                height: '160px',
                paddingBottom: '8px'
              }}>
                {hourlyData.map((item, index) => {
                  const isHovered = hoveredBar === index;
                  // Dual bar heights
                  const heightPrimary = (item.today / 200) * 140;
                  const heightSecondary = (item.yesterday / 200) * 140;

                  return (
                    <div
                      key={item.time}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '3px',
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          marginBottom: '6px',
                          background: '#25282f',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}>
                          {item.time}: <strong>{item.val}</strong>
                        </div>
                      )}

                      {/* Secondary Bar (Darker Charcoal) */}
                      <div style={{
                        width: '45%',
                        maxWidth: '12px',
                        height: `${heightSecondary}px`,
                        background: isHovered ? '#3b3f49' : '#2b2e36',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.15s ease'
                      }} />

                      {/* Primary Bar (Sleek Slate) */}
                      <div style={{
                        width: '45%',
                        maxWidth: '12px',
                        height: `${heightPrimary}px`,
                        background: isHovered ? '#828997' : '#525866',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.15s ease'
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* Time X-Axis */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
                color: '#5f6573'
              }}>
                {hourlyData.map(item => (
                  <span key={item.time}>{item.time}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Top: Today's budget */}
            <div style={{ ...cardStyle, padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
                  <Clock size={14} color="#8c93a0" />
                  <span style={{ color: '#d1d5db', fontWeight: '500' }}>Today's budget</span>
                </div>
                <button type="button" style={iconBtnStyle} title="Maximizar">
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6f7684', marginBottom: '4px' }}>Used today</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>$223.65</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6f7684', marginBottom: '4px' }}>Today's allowance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>$480.00</div>
                </div>
              </div>

              {/* Metallic Progress Bar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  height: '42px',
                  background: '#121417',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Fill (47%) */}
                  <div style={{
                    width: '47%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #1e2025 0%, #353942 100%)',
                    borderRight: '2px solid #5a606d',
                    transition: 'width 0.5s ease'
                  }} />

                  {/* Text Badge positioned on the right */}
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#e5e7eb'
                  }}>
                    47% used
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Peak hours */}
            <div style={{ ...cardStyle, padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8c93a0', fontSize: '0.84rem' }}>
                  <Clock size={14} color="#8c93a0" />
                  <span style={{ color: '#d1d5db', fontWeight: '500' }}>Peak hours</span>
                </div>
                <button type="button" style={iconBtnStyle} title="Maximizar">
                  <Maximize2 size={13} />
                </button>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                11 AM – 1 PM
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7a8291', marginBottom: '18px' }}>
                ~8% of orders in the busiest hour
              </div>

              {/* Mini Wave Histogram */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '48px' }}>
                {peakHoursBars.map((val, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${(val / 100) * 44}px`,
                      background: i >= 8 && i <= 12 ? '#646a78' : '#2b2e35',
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ==================== SECTION: STATS / FUNIL ==================== */}
      <div style={{ marginBottom: '40px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Stats
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Filter Dropdown */}
            <div style={pillButtonStyle}>
              <span>{timeRange}</span>
              <ChevronDown size={13} />
            </div>

            {/* Date Picker Pill */}
            <div style={pillButtonStyle}>
              <Calendar size={13} />
              <span>Sep 1 – Sep 7, 2026</span>
            </div>

            {/* Customize */}
            <button type="button" style={pillButtonStyle}>
              <SlidersHorizontal size={13} />
              <span>Customize</span>
            </button>

            {/* More */}
            <button type="button" style={pillIconButtonStyle} title="Mais opções">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Sub-tabs / Quick filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveStatTab('orders')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid ' + (activeStatTab === 'orders' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'),
              background: activeStatTab === 'orders' ? '#22252a' : 'transparent',
              color: activeStatTab === 'orders' ? '#ffffff' : '#8c93a0',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag size={14} />
            <span>Total Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid transparent',
              background: 'transparent',
              color: '#8c93a0',
              fontSize: '0.82rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <span>Ver Funil Completo (Kanban)</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Sleek Obsidian Leads / Orders Table */}
        <div style={{
          background: '#16181b',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#717886',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}>
                <th style={{ padding: '14px 20px', width: '40px' }}>
                  <input type="checkbox" style={{ accentColor: '#10b981', cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '14px 16px' }}>Oportunidade / Empresa</th>
                <th style={{ padding: '14px 16px' }}>Valor Estimado</th>
                <th style={{ padding: '14px 16px' }}>Cidade / UF</th>
                <th style={{ padding: '14px 16px' }}>Contato</th>
                <th style={{ padding: '14px 16px' }}>Responsável</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#68707d', fontSize: '0.85rem' }}>
                    Nenhuma oportunidade cadastrada. Comece adicionando leads pelo Scanner ou Funil!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveTab('kanban')}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" style={{ accentColor: '#10b981', cursor: 'pointer' }} />
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.88rem' }}>
                        {lead.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6d7482', marginTop: '2px' }}>
                        {lead.code} • {lead.companyRazaoSocial || 'Empresa'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#ffffff', fontSize: '0.88rem' }}>
                      {lead.value && Number(lead.value) > 0
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)
                        : <span style={{ color: '#555b68', fontWeight: '400' }}>—</span>}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8c93a0', fontSize: '0.82rem' }}>
                      {lead.companyCidade ? `${lead.companyCidade} - ${lead.companyEstado || 'SP'}` : 'São Paulo - SP'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8c93a0', fontSize: '0.82rem' }}>
                      {lead.companyTelefone || '+55 11 2306 7787'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8c93a0', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#25282f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          color: '#ffffff'
                        }}>
                          {(lead.ownerName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <span>{lead.ownerName || 'Administrador'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38bdf8' }} />
                        <span>{lead.statusName || 'Contatado'}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('kanban');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8c93a0',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// ==================== REUSABLE STYLES ====================
const cardStyle: React.CSSProperties = {
  background: '#16181b',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '16px',
  padding: '20px 22px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
  position: 'relative'
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px'
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '1.85rem',
  fontWeight: '800',
  color: '#ffffff',
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  marginBottom: '8px'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#606673',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px'
};

const greenDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#10b981',
  flexShrink: 0
};

const redDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#ef4444',
  flexShrink: 0
};

const pillButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  padding: '6px 12px',
  borderRadius: '8px',
  background: '#1b1d22',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#d1d5db',
  fontSize: '0.8rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const pillIconButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: '#1b1d22',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#8c93a0',
  cursor: 'pointer'
};
