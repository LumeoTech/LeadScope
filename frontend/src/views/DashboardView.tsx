import React, { useEffect, useState, useMemo } from 'react';
import { api, Lead, Company, AuditLog } from '../services/api';
import { ActiveTab } from '../components/Sidebar';
import {
  Flag,
  Calendar as CalendarIcon,
  Crosshair,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  SlidersHorizontal,
  Clock,
  Maximize2,
  Calendar,
  ChevronDown,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Filter states
  const [timeRange, setTimeRange] = useState<'Last 7 days' | 'Today' | 'Last 30 days' | 'All time'>('Last 7 days');
  const [activeStatTab, setActiveStatTab] = useState<'orders' | 'leads'>('orders');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, compRes, auditRes] = await Promise.all([
        api.leads.list(),
        api.companies.list(),
        api.audit.list().catch(() => ({ content: [] }))
      ]);
      setLeads(leadsRes.content || []);
      setCompanies(compRes.content || []);
      setAuditLogs(auditRes.content || []);
    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // ==================== REAL DATA CALCULATIONS ====================
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 1. KPI: Active Campaigns (Active leads in pipeline)
  const activeLeads = useMemo(() => {
    return leads.filter(l => {
      const name = l.statusName?.toLowerCase() || '';
      return !name.includes('perdido') && !name.includes('cancelado');
    });
  }, [leads]);
  const activeCampaignsCount = activeLeads.length;

  const leadsThisMonth = useMemo(() => {
    return leads.filter(l => new Date(l.createdAt) >= firstDayThisMonth).length;
  }, [leads, firstDayThisMonth]);

  const leadsLastMonth = useMemo(() => {
    return leads.filter(l => {
      const d = new Date(l.createdAt);
      return d >= firstDayLastMonth && d < firstDayThisMonth;
    }).length;
  }, [leads, firstDayLastMonth, firstDayThisMonth]);

  const campaignsGrowth = leadsLastMonth > 0
    ? (((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100).toFixed(1)
    : (leadsThisMonth > 0 ? '100.0' : '0.0');
  const isCampaignsPositive = Number(campaignsGrowth) >= 0;

  // 2. KPI: Posts Published (Total Registered Companies / Base Contacts)
  const contactsCount = companies.length;
  const compThisMonth = useMemo(() => {
    return companies.filter(c => new Date(c.createdAt) >= firstDayThisMonth).length;
  }, [companies, firstDayThisMonth]);

  const compLastMonth = useMemo(() => {
    return companies.filter(c => {
      const d = new Date(c.createdAt);
      return d >= firstDayLastMonth && d < firstDayThisMonth;
    }).length;
  }, [companies, firstDayLastMonth, firstDayThisMonth]);

  const compGrowth = compLastMonth > 0
    ? (((compThisMonth - compLastMonth) / compLastMonth) * 100).toFixed(1)
    : (compThisMonth > 0 ? '100.0' : '0.0');
  const isCompPositive = Number(compGrowth) >= 0;

  // 3. KPI: Total Reach (Total Pipeline Value in R$)
  const totalPipelineValue = useMemo(() => {
    return leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  }, [leads]);

  const formatShortCurrency = (val: number) => {
    if (val === 0) return 'R$ 0';
    if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(1)}K`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };
  const totalReachStr = formatShortCurrency(totalPipelineValue);

  const leadsWithValueCount = useMemo(() => {
    return leads.filter(l => l.value && Number(l.value) > 0).length;
  }, [leads]);

  const reachPct = leads.length > 0
    ? ((leadsWithValueCount / leads.length) * 100).toFixed(1)
    : '0.0';

  // 4. KPI: Avg. engagement (Conversion / Win Rate)
  const wonLeadsCount = useMemo(() => {
    return leads.filter(l => {
      const name = l.statusName?.toLowerCase() || '';
      return name.includes('ganho') || name.includes('fechado') || name.includes('aceito');
    }).length;
  }, [leads]);

  const winRate = leads.length > 0 ? ((wonLeadsCount / leads.length) * 100).toFixed(1) : '0.0';

  // ==================== TODAY SECTION: REVENUE ====================
  const wonToday = useMemo(() => {
    return leads.filter(l => {
      const d = new Date(l.updatedAt || l.createdAt);
      const isWon = (l.statusName?.toLowerCase() || '').includes('ganho') || (l.statusName?.toLowerCase() || '').includes('aceito');
      return isWon && d >= todayStart;
    });
  }, [leads, todayStart]);
  const revenueToday = wonToday.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

  const wonYesterday = useMemo(() => {
    return leads.filter(l => {
      const d = new Date(l.updatedAt || l.createdAt);
      const isWon = (l.statusName?.toLowerCase() || '').includes('ganho') || (l.statusName?.toLowerCase() || '').includes('aceito');
      return isWon && d >= yesterdayStart && d < todayStart;
    });
  }, [leads, yesterdayStart, todayStart]);
  const revenueYesterday = wonYesterday.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

  const revenueGrowth = revenueYesterday > 0
    ? (((revenueToday - revenueYesterday) / revenueYesterday) * 100).toFixed(1)
    : (revenueToday > 0 ? '100.0' : '0.0');
  const isRevPositive = Number(revenueGrowth) >= 0;

  // Hourly distribution for the Gross Revenue chart based on real leads/actions
  const hourlySlots = ['19:00', '21:00', '23:00', '01:00', '03:00', '05:00', '07:00', '09:00', '11:00', '13:00', '15:00', '17:00'];
  
  const hourlyData = useMemo(() => {
    return hourlySlots.map((slot) => {
      const slotHour = parseInt(slot.split(':')[0], 10);
      
      const countToday = leads.filter(l => {
        const d = new Date(l.createdAt);
        if (d < todayStart) return false;
        const h = d.getHours();
        return h >= slotHour && h < slotHour + 2;
      }).length;

      const countYesterday = leads.filter(l => {
        const d = new Date(l.createdAt);
        if (d < yesterdayStart || d >= todayStart) return false;
        const h = d.getHours();
        return h >= slotHour && h < slotHour + 2;
      }).length;

      return {
        time: slot,
        today: countToday,
        yesterday: countYesterday,
        val: `${countToday} lead${countToday === 1 ? '' : 's'}`
      };
    });
  }, [leads, todayStart, yesterdayStart]);

  const maxHourlyCount = Math.max(...hourlyData.map(d => Math.max(d.today, d.yesterday)), 1);

  // ==================== TODAY'S BUDGET ====================
  // Used today: total value of leads created or updated today
  const usedTodayValue = useMemo(() => {
    return leads
      .filter(l => new Date(l.createdAt) >= todayStart)
      .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  }, [leads, todayStart]);

  // Today's allowance: derived from commercial goals or 0 if not defined
  const savedGoals = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('lumeo_crm_goals') || '[]');
    } catch {
      return [];
    }
  }, []);

  const revenueGoal = savedGoals.find((g: any) => g.category === 'REVENUE')?.targetValue || 0;
  const todayAllowance = revenueGoal > 0 ? Math.round(revenueGoal / 30) : 0;

  const budgetUsedPercent = todayAllowance > 0
    ? Math.min(100, Math.round((usedTodayValue / todayAllowance) * 100))
    : (usedTodayValue > 0 ? 100 : 0);

  // ==================== PEAK HOURS (REAL ACTIVITY DISTRIBUTION) ====================
  const { peakLabel, peakPct, peakBars } = useMemo(() => {
    const hourCounts = new Array(24).fill(0);
    
    // Count hourly occurrences across all leads and audit logs
    leads.forEach(l => {
      const h = new Date(l.createdAt).getHours();
      hourCounts[h] += 1;
    });
    auditLogs.forEach(a => {
      const h = new Date(a.createdAt).getHours();
      hourCounts[h] += 1;
    });

    const totalActions = hourCounts.reduce((a, b) => a + b, 0);

    let maxWindow = 0;
    let peakStartHour = 11;

    for (let h = 0; h < 23; h++) {
      const sum = hourCounts[h] + hourCounts[h + 1];
      if (sum > maxWindow) {
        maxWindow = sum;
        peakStartHour = h;
      }
    }

    const formatHourAmPm = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12} ${period}`;
    };

    const label = totalActions > 0
      ? `${formatHourAmPm(peakStartHour)} – ${formatHourAmPm(peakStartHour + 2)}`
      : 'Sem dados';

    const pct = totalActions > 0
      ? Math.round((maxWindow / totalActions) * 100)
      : 0;

    // 20 bars representing hours 04:00 to 23:00
    const maxVal = Math.max(...hourCounts, 1);
    const bars = [];
    for (let i = 4; i < 24; i++) {
      const val = totalActions > 0 ? hourCounts[i] : 0;
      bars.push({
        hour: i,
        height: totalActions > 0 ? (val / maxVal) * 44 : 2,
        isPeak: i >= peakStartHour && i <= peakStartHour + 1 && val > 0
      });
    }

    return { peakLabel: label, peakPct: pct, peakBars: bars };
  }, [leads, auditLogs]);

  // ==================== STATS SECTION FILTERING ====================
  const filteredLeads = useMemo(() => {
    if (timeRange === 'All time') return leads;
    
    const cutoff = new Date();
    if (timeRange === 'Today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeRange === 'Last 7 days') {
      cutoff.setDate(cutoff.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeRange === 'Last 30 days') {
      cutoff.setDate(cutoff.getDate() - 30);
      cutoff.setHours(0, 0, 0, 0);
    }
    
    return leads.filter(l => new Date(l.createdAt) >= cutoff);
  }, [leads, timeRange]);

  // Date Range Display string
  const dateRangeDisplay = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (timeRange === 'Today') {
      return start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (timeRange === 'Last 7 days') {
      start.setDate(start.getDate() - 7);
    } else if (timeRange === 'Last 30 days') {
      start.setDate(start.getDate() - 30);
    } else {
      return 'Todos os registros';
    }
    const startStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }, [timeRange]);

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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: isCampaignsPositive ? '#10b981' : '#ef4444',
            fontWeight: '500'
          }}>
            <span style={isCampaignsPositive ? greenDotStyle : redDotStyle} />
            <span>{campaignsGrowth}%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>

        {/* Card 2: Posts Published (Empresas / Contatos) */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: isCompPositive ? '#10b981' : '#ef4444',
            fontWeight: '500'
          }}>
            <span style={isCompPositive ? greenDotStyle : redDotStyle} />
            <span>{compGrowth}%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>since last month</span>
          </div>
        </div>

        {/* Card 3: Total Reach (Valor Total do Funil) */}
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
            <span>{reachPct}%</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>com valor definido</span>
          </div>
        </div>

        {/* Card 4: Avg. engagement (Taxa de Conversão Real) */}
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
          <div style={kpiValueStyle}>{winRate}%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: wonLeadsCount > 0 ? '#10b981' : '#68707d', fontWeight: '500' }}>
            <span style={wonLeadsCount > 0 ? greenDotStyle : grayDotStyle} />
            <span>{wonLeadsCount}</span>
            <span style={{ color: '#68707d', fontWeight: '400' }}>ganhos de {leads.length} leads</span>
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
            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              style={pillButtonStyle}
            >
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
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', marginLeft: '2px' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueToday)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5a616d' }} />
                <span style={{ color: '#8c93a0', fontSize: '0.82rem' }}>Yesterday</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#8c93a0', marginLeft: '2px' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueYesterday)}
                </span>
              </div>

              <div style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: isRevPositive ? '#10b981' : '#ef4444',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <span style={isRevPositive ? greenDotStyle : redDotStyle} />
                <span>{revenueGrowth}%</span>
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
                  // Dual bar heights based strictly on actual count of leads/actions
                  const heightPrimary = item.today > 0
                    ? Math.max(8, (item.today / maxHourlyCount) * 140)
                    : 2;
                  const heightSecondary = item.yesterday > 0
                    ? Math.max(8, (item.yesterday / maxHourlyCount) * 140)
                    : 2;

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
                          {item.time}: <strong>{item.today} hoje</strong> / {item.yesterday} ontem
                        </div>
                      )}

                      {/* Secondary Bar (Yesterday) */}
                      <div style={{
                        width: '45%',
                        maxWidth: '12px',
                        height: `${heightSecondary}px`,
                        background: isHovered ? '#3b3f49' : (item.yesterday > 0 ? '#2b2e36' : 'rgba(255,255,255,0.04)'),
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.15s ease'
                      }} />

                      {/* Primary Bar (Today) */}
                      <div style={{
                        width: '45%',
                        maxWidth: '12px',
                        height: `${heightPrimary}px`,
                        background: isHovered ? '#828997' : (item.today > 0 ? '#525866' : 'rgba(255,255,255,0.06)'),
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
                <button
                  type="button"
                  onClick={() => setActiveTab('goals')}
                  style={iconBtnStyle}
                  title="Configurar Metas"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6f7684', marginBottom: '4px' }}>Used today</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(usedTodayValue)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6f7684', marginBottom: '4px' }}>Today's allowance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
                    {todayAllowance > 0
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todayAllowance)
                      : 'R$ 0,00'}
                  </div>
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
                  {/* Real Fill */}
                  <div style={{
                    width: `${budgetUsedPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #1e2025 0%, #353942 100%)',
                    borderRight: budgetUsedPercent > 0 ? '2px solid #5a606d' : 'none',
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
                    {budgetUsedPercent}% used
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
                {peakLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7a8291', marginBottom: '18px' }}>
                {peakPct > 0
                  ? `~${peakPct}% das ações no horário mais movimentado`
                  : 'Nenhuma atividade registrada no momento'}
              </div>

              {/* Wave Histogram calculated from real hourly distribution */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '48px' }}>
                {peakBars.map((bar, i) => (
                  <div
                    key={i}
                    title={`${bar.hour}:00`}
                    style={{
                      flex: 1,
                      height: `${bar.height}px`,
                      background: bar.isPeak ? '#646a78' : (bar.height > 2 ? '#2b2e35' : 'rgba(255,255,255,0.05)'),
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
            <div style={{ position: 'relative' }}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                style={{
                  ...pillButtonStyle,
                  appearance: 'none',
                  paddingRight: '28px',
                  background: '#1b1d22',
                  cursor: 'pointer'
                }}
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Today">Today</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="All time">All time</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '10px', pointerEvents: 'none', color: '#8c93a0' }} />
            </div>

            {/* Real Date Picker Pill */}
            <div style={pillButtonStyle}>
              <Calendar size={13} />
              <span>{dateRangeDisplay}</span>
            </div>

            {/* Customize */}
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              style={pillButtonStyle}
            >
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
            <span>Total Orders ({filteredLeads.length})</span>
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
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px 20px', textAlign: 'center', color: '#68707d', fontSize: '0.85rem' }}>
                    Nenhuma oportunidade encontrada no período selecionado.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
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
                        {lead.code ? `${lead.code} • ` : ''}{lead.companyRazaoSocial || lead.companyNomeFantasia || 'Empresa'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#ffffff', fontSize: '0.88rem' }}>
                      {lead.value && Number(lead.value) > 0
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)
                        : <span style={{ color: '#555b68', fontWeight: '400' }}>—</span>}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8c93a0', fontSize: '0.82rem' }}>
                      {lead.companyCidade ? `${lead.companyCidade}${lead.companyEstado ? ` - ${lead.companyEstado}` : ''}` : '—'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8c93a0', fontSize: '0.82rem' }}>
                      {lead.companyTelefone || lead.phone || '—'}
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
                          {(lead.ownerName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span>{lead.ownerName || 'Não atribuído'}</span>
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
                        <span>{lead.statusName || 'Novo'}</span>
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

const grayDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#6b7280',
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

