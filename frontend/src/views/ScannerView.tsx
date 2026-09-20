import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, PlaceLead } from '../services/api';
import {
  MapPin,
  Search,
  X,
  Sparkles,
  Layers,
  Phone,
  Globe,
  Star,
  Download,
  CheckCircle2,
  FilePlus,
  Compass,
  Building2,
  Trash2,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
  HeartPulse,
  Dog,
  Utensils,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Mail
} from 'lucide-react';

// ——————————————————————————————————————————————————————————
// Tipos & Modelos
// ——————————————————————————————————————————————————————————
export interface ScannedLead {
  id: string;
  name: string;
  category: string;
  address: string;
  city?: string;
  state?: string;
  phone: string | null;
  website: string | null;
  email?: string | null;
  rating: number | null;
  reviewCount: number | null;
  status: 'Novo' | 'Contatado' | 'Qualificado' | 'Descartado';
  addedToCrm?: boolean;
  companyId?: number;
  leadId?: number;
  lat?: number | null;
  lng?: number | null;
}

interface ScannerViewProps {
  onNavigate?: (tab: any) => void;
}

// Grupos de nichos solicitados
const NICHE_GROUPS = [
  {
    name: 'SAÚDE & BEM-ESTAR',
    icon: HeartPulse,
    niches: [
      'Dentista', 'Clínica odontológica', 'Ortodontista', 'Clínica médica', 'Clínica de estética',
      'Cirurgia plástica', 'Dermatologista', 'Cardiologista', 'Ortopedia', 'Ginecologista',
      'Pediatria', 'Psicólogo', 'Psiquiatria', 'Nutricionista', 'Fisioterapeuta', 'Academia',
      'Pilates', 'Studio de yoga', 'Crossfit', 'Personal trainer', 'Spa', 'Clínica de depilação',
      'Esmalteria', 'Podologia', 'Studio de tatuagem', 'Clínica de micropigmentação', 'Laboratório de análises'
    ]
  },
  {
    name: 'PET & VETERINÁRIA',
    icon: Dog,
    niches: [
      'Pet shop', 'Veterinária', 'Clínica veterinária', 'Grooming', 'Hotel para pets'
    ]
  },
  {
    name: 'BELEZA & ESTÉTICA',
    icon: Sparkles,
    niches: [
      'Salão de beleza', 'Barbearia', 'Manicure', 'Cabeleireiro', 'Studio de sobrancelha', 'Designer de sobrancelha'
    ]
  },
  {
    name: 'ALIMENTAÇÃO',
    icon: Utensils,
    niches: [
      'Restaurante', 'Lanchonete', 'Pizzaria', 'Cafeteria', 'Padaria', 'Delivery', 'Food truck'
    ]
  },
  {
    name: 'EDUCAÇÃO',
    icon: GraduationCap,
    niches: [
      'Escola', 'Curso livre', 'Escola de idiomas', 'Reforço escolar', 'Creche', 'Escola técnica'
    ]
  },
  {
    name: 'SERVIÇOS',
    icon: Briefcase,
    niches: [
      'Contabilidade', 'Advocacia', 'Imobiliária', 'Corretora de seguros', 'Consultoria', 'Agência de marketing', 'Gráfica', 'Coworking'
    ]
  }
];

export const ScannerView: React.FC<ScannerViewProps> = ({ onNavigate }) => {
  // ——————————————————————————————————————————————————————————
  // 1. Estado da Localização (Leaflet)
  // ——————————————————————————————————————————————————————————
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>({
    lat: -23.5505,
    lng: -46.6333
  });
  const [locationName, setLocationName] = useState<string>('São Paulo — SP (Região Central)');
  const [geocoding, setGeocoding] = useState<boolean>(false);

  // ——————————————————————————————————————————————————————————
  // 2. Estado dos Segmentos / Nichos
  // ——————————————————————————————————————————————————————————
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Clínica odontológica', 'Psicólogo']);
  const [nicheSearch, setNicheSearch] = useState<string>('');

  // ——————————————————————————————————————————————————————————
  // 3. Estado de Fontes de Dados e Filtros
  // ——————————————————————————————————————————————————————————
  const [dataSource, setDataSource] = useState<'OPENSTREETMAP' | 'GOOGLE_MAPS'>('OPENSTREETMAP');
  const [captureFilter, setCaptureFilter] = useState<'ALL' | 'PHONE_ONLY' | 'PHONE_AND_WEB'>('ALL');
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>('');
  const [isSearchingArea, setIsSearchingArea] = useState<boolean>(false);

  // ——————————————————————————————————————————————————————————
  // 4. Estado de Resultados & Busca
  // ——————————————————————————————————————————————————————————
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [leads, setLeads] = useState<ScannedLead[]>([]);
  const [totalFoundLeads, setTotalFoundLeads] = useState<number>(0);
  const [discardedLeadsCount, setDiscardedLeadsCount] = useState<number>(0);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Novo' | 'Contatado' | 'Qualificado' | 'Descartado'>('TODOS');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'name' | 'reviews'>('relevance');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [addingId, setAddingId] = useState<string | null>(null);
  const [batchAdding, setBatchAdding] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ——————————————————————————————————————————————————————————
  // Inicialização do Mapa Leaflet com OpenStreetMap (Sem marcas d'água / Sem API Key)
  // ——————————————————————————————————————————————————————————
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const initialLat = selectedCoords?.lat || -23.5505;
    const initialLng = selectedCoords?.lng || -46.6333;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap padrão: gratuito, livre e sem "API KEY REQUIRED"
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Coloca marcador inicial
    updateMapMarker(initialLat, initialLng);

    // Evento de clique no mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });
      updateMapMarker(lat, lng);
      reverseGeocode(lat, lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const createCustomPin = () => {
    return L.divIcon({
      className: 'kaptar-map-pin',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 5px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; box-shadow: 0 6px 18px rgba(139, 92, 246, 0.7); border: 1.5px solid rgba(255,255,255,0.4); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span>🎯</span>
            <span>Local de Varredura</span>
          </div>
          <div style="width: 12px; height: 12px; background: #8b5cf6; transform: rotate(45deg); margin-top: -6px; border-bottom: 2px solid white; border-right: 2px solid white;"></div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1; margin-top: 2px; box-shadow: 0 0 12px #8b5cf6;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  const updateMapMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: createCustomPin() }).addTo(mapInstanceRef.current);
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: 3000,
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.14,
        weight: 2,
        dashArray: '6, 6'
      }).addTo(mapInstanceRef.current);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.municipality || 'São Paulo';
        const state = addr.state ? addr.state.substring(0, 2).toUpperCase() : 'SP';
        setLocationName(`${road ? road + ', ' : ''}${city} — ${state}`);
      } else {
        setLocationName(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const clearLocation = () => {
    setSelectedCoords(null);
    setLocationName('Nenhum ponto marcado');
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }
    }
  };

  // ——————————————————————————————————————————————————————————
  // Busca por Rua ou Bairro (Geocoding com centralização automática)
  // ——————————————————————————————————————————————————————————
  const handleAreaSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = areaSearchQuery.trim();
    if (!query) return;

    setIsSearchingArea(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          setSelectedCoords({ lat, lng });
          updateMapMarker(lat, lng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
          }
          const addr = item.address || {};
          const road = addr.road || addr.suburb || addr.neighbourhood || '';
          const city = addr.city || addr.town || addr.municipality || 'Local';
          const state = addr.state ? addr.state.substring(0, 2).toUpperCase() : '';
          setLocationName(road ? `${road}, ${city} — ${state}` : item.display_name.split(',').slice(0, 3).join(', '));
        } else {
          alert('Localização não encontrada. Tente incluir nome da cidade (ex: "Vila Madalena, São Paulo").');
        }
      } else {
        alert('Erro na consulta de geocodificação.');
      }
    } catch {
      alert('Erro de conexão ao buscar endereço.');
    } finally {
      setIsSearchingArea(false);
    }
  };

  // ——————————————————————————————————————————————————————————
  // Gestão de Nichos
  // ——————————————————————————————————————————————————————————
  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  const removeNiche = (niche: string) => {
    setSelectedNiches(prev => prev.filter(n => n !== niche));
  };

  const clearAllNiches = () => {
    setSelectedNiches([]);
  };

  // ——————————————————————————————————————————————————————————
  // Executar Busca de Leads via API REAL (Google Places)
  // ——————————————————————————————————————————————————————————
  const handleSearch = async () => {
    if (!selectedCoords) {
      alert('Por favor, clique no mapa para marcar a localização de busca.');
      return;
    }

    if (selectedNiches.length === 0) {
      alert('Por favor, selecione ao menos um nicho/categoria para a busca.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Chama o backend real (OpenStreetMap sem chaves ou Google Places se configurada)
      const searchRes = await api.scanner.searchPlaces({
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        radius: 3000,
        categories: selectedNiches,
        captureFilter: captureFilter,
        source: dataSource
      });

      const realPlaces = searchRes.leads || [];
      setTotalFoundLeads(searchRes.totalFound || realPlaces.length);
      setDiscardedLeadsCount(searchRes.discardedCount || 0);

      // Mapeia os dados reais retornados (sem nunca inferir ou gerar telefone/site fictícios)
      const mappedLeads: ScannedLead[] = realPlaces.map((item, idx) => ({
        id: item.placeId || `lead-${idx}`,
        name: item.name,
        category: item.category,
        address: item.formattedAddress,
        phone: item.formattedPhoneNumber, // real ou null
        website: item.website,             // real ou null
        email: item.email || null,         // real ou null
        rating: item.rating,
        reviewCount: item.userRatingsTotal,
        status: 'Novo',
        addedToCrm: false,
        lat: item.latitude,
        lng: item.longitude
      }));

      setLeads(mappedLeads);
      setHasSearched(true);
      setCurrentPage(1);
      setSelectedLeadIds([]);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao realizar varredura de empresas na região.';
      setSearchError(errorMsg);
      setHasSearched(true);
      setLeads([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ——————————————————————————————————————————————————————————
  // Ações nos Leads (CRM, Proposta, Status, CSV)
  // ——————————————————————————————————————————————————————————
  const handleAddToCrm = async (lead: ScannedLead) => {
    if (lead.addedToCrm) return;
    setAddingId(lead.id);

    try {
      const company = await api.companies.create({
        razaoSocial: lead.name,
        nomeFantasia: lead.name,
        segmento: lead.category,
        telefone: lead.phone || '',
        website: lead.website || '',
        email: lead.email || '',
        cidade: locationName.split('—')[0]?.trim() || '',
        estado: (locationName.split('—')[1]?.trim() || 'SP').substring(0, 2),
        source: 'PROSPECCAO'
      });

      const createdLead = await api.leads.create({
        companyId: company.id,
        statusId: 1, // "Novo"
        title: `Oportunidade: ${lead.name} (${lead.category})`,
        priority: 'MEDIA',
        source: 'PROSPECCAO',
        value: 2500
      });

      setLeads(prev => prev.map(item =>
        item.id === lead.id ? { ...item, addedToCrm: true, companyId: company.id, leadId: createdLead.id } : item
      ));

    } catch (err: any) {
      alert('Erro ao adicionar lead ao CRM: ' + (err.message || 'Erro de conexão'));
    } finally {
      setAddingId(null);
    }
  };

  const handleBatchAddToCrm = async () => {
    if (selectedLeadIds.length === 0) return;
    setBatchAdding(true);

    const toAdd = leads.filter(l => selectedLeadIds.includes(l.id) && !l.addedToCrm);
    for (const lead of toAdd) {
      await handleAddToCrm(lead);
    }

    setBatchAdding(false);
    setSelectedLeadIds([]);
  };

  const handleCreateProposal = async (lead: ScannedLead) => {
    if (!lead.addedToCrm) {
      await handleAddToCrm(lead);
    }
    if (onNavigate) {
      onNavigate('proposals');
    } else {
      alert(`Lead "${lead.name}" pronto no CRM. Acesse a aba de Propostas no menu.`);
    }
  };

  const handleStatusChange = (leadId: string, newStatus: ScannedLead['status']) => {
    setLeads(prev => prev.map(item =>
      item.id === leadId ? { ...item, status: newStatus } : item
    ));
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPage = (pageItems: ScannedLead[]) => {
    const pageIds = pageItems.map(p => p.id);
    const allSelected = pageIds.every(id => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const exportCsv = (onlySelected: boolean = false) => {
    const targetLeads = onlySelected
      ? leads.filter(l => selectedLeadIds.includes(l.id))
      : leads;

    if (targetLeads.length === 0) {
      alert('Nenhum lead selecionado para exportar.');
      return;
    }

    const headers = ['Nome da Empresa', 'Categoria / Nicho', 'E-mail', 'Telefone', 'Site', 'Endereço', 'Avaliação', 'Reviews', 'Status', 'No CRM'];
    const rows = targetLeads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.email || 'Sem e-mail'}"`,
      `"${l.phone || 'Sem telefone'}"`,
      `"${l.website || 'Sem site'}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      l.rating != null ? l.rating : 'N/A',
      l.reviewCount != null ? l.reviewCount : 0,
      l.status,
      l.addedToCrm ? 'Sim' : 'Não'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_prospeccao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ——————————————————————————————————————————————————————————
  // Filtros e Ordenação da Lista
  // ——————————————————————————————————————————————————————————
  const filteredLeads = leads
    .filter(l => statusFilter === 'TODOS' || l.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '1380px', margin: '0 auto' }}>
      
      {/* HEADER PRINCIPAL */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)'
          }}>
            <Compass size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Prospecção de Novos Clientes
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Localize estabelecimentos e oportunidades comerciais ativas na sua área
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

        {/* ———————————————————————————————————————————————————— */}
        {/* SEÇÃO 1 — LOCALIZAÇÃO */}
        {/* ———————————————————————————————————————————————————— */}
        <section className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#8b5cf6" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Localização — clique no mapa para marcar onde buscar
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {geocoding ? 'Detectando endereço do ponto...' : locationName}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={clearLocation}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} />
                Limpar marcação
              </button>
            </div>
          </div>

          {/* BARRA DE BUSCA POR RUA OU BAIRRO */}
          <form
            onSubmit={handleAreaSearch}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={areaSearchQuery}
                onChange={e => setAreaSearchQuery(e.target.value)}
                placeholder="Digite uma rua ou bairro para buscar..."
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg-input, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  color: 'var(--text-primary, #ffffff)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingArea || !areaSearchQuery.trim()}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                cursor: isSearchingArea ? 'wait' : 'pointer'
              }}
            >
              {isSearchingArea ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
              Buscar área
            </button>
          </form>

          {/* Container do Mapa Leaflet com OpenStreetMap */}
          <div
            ref={mapContainerRef}
            style={{
              height: '320px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              zIndex: 1
            }}
          />

          {selectedCoords && (
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span>
                <strong>Raio de Captura:</strong> 3.000m ao redor do ponto ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>Clique no mapa para alterar o ponto</span>
            </div>
          )}
        </section>

        {/* ———————————————————————————————————————————————————— */}
        {/* SEÇÃO 2 — CATEGORIAS / SEGMENTOS */}
        {/* ———————————————————————————————————————————————————— */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} color="#a855f7" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Categorias / Segmentos
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#a855f7' }}>{selectedNiches.length}</strong> selecionados
              </span>
              {selectedNiches.length > 0 && (
                <>
                  <span style={{ color: 'var(--border-glass)' }}>|</span>
                  <button
                    onClick={clearAllNiches}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                  >
                    Limpar
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedNiches.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '12px 14px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '16px'
            }}>
              {selectedNiches.map(niche => (
                <span
                  key={niche}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3))',
                    border: '1px solid rgba(139, 92, 246, 0.6)',
                    color: '#fff'
                  }}
                >
                  {niche}
                  <button
                    type="button"
                    onClick={() => removeNiche(niche)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={nicheSearch}
              onChange={(e) => setNicheSearch(e.target.value)}
              placeholder="Toque para escolher os nichos..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                background: 'rgba(15, 21, 35, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {NICHE_GROUPS.map((group) => {
              const filteredNiches = group.niches.filter(n =>
                n.toLowerCase().includes(nicheSearch.toLowerCase())
              );

              if (filteredNiches.length === 0) return null;
              const IconComponent = group.icon;

              return (
                <div key={group.name} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <IconComponent size={15} color="#8b5cf6" />
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                      {group.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({filteredNiches.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {filteredNiches.map(niche => {
                      const isSelected = selectedNiches.includes(niche);
                      return (
                        <button
                          key={niche}
                          type="button"
                          onClick={() => toggleNiche(niche)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontSize: '12px',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isSelected
                              ? '1px solid #8b5cf6'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(99, 102, 241, 0.85))'
                              : 'rgba(22, 30, 49, 0.5)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            boxShadow: isSelected ? '0 2px 8px rgba(139, 92, 246, 0.35)' : 'none'
                          }}
                        >
                          {isSelected && <span style={{ marginRight: '4px' }}>✓</span>}
                          {niche}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ———————————————————————————————————————————————————— */}
        {/* SEÇÃO 3 — FONTE DE DADOS E FILTROS */}
        {/* ———————————————————————————————————————————————————— */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={18} color="#6366f1" />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              Fonte de Dados e Filtros
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500 }}>
                FONTE DE DADOS
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: dataSource === 'OPENSTREETMAP' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: dataSource === 'OPENSTREETMAP' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="dataSource"
                      checked={dataSource === 'OPENSTREETMAP'}
                      onChange={() => setDataSource('OPENSTREETMAP')}
                      style={{ accentColor: '#10b981' }}
                    />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>OpenStreetMap</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% Gratuito & Aberto (Sem API Key)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', background: '#10b981', color: '#fff', fontWeight: 700 }}>
                    LIVRE
                  </span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: dataSource === 'GOOGLE_MAPS' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: dataSource === 'GOOGLE_MAPS' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="dataSource"
                      checked={dataSource === 'GOOGLE_MAPS'}
                      onChange={() => setDataSource('GOOGLE_MAPS')}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>Google Places API</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requer chave configurada no backend</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', background: '#6366f1', color: '#fff', fontWeight: 600 }}>
                    GOOGLE
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500 }}>
                FILTRO DE CAPTURA
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setCaptureFilter('ALL')}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: captureFilter === 'ALL' ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: captureFilter === 'ALL' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: captureFilter === 'ALL' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Building2 size={14} color={captureFilter === 'ALL' ? '#8b5cf6' : 'currentColor'} />
                  Todos
                </button>

                <button
                  type="button"
                  onClick={() => setCaptureFilter('PHONE_ONLY')}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: captureFilter === 'PHONE_ONLY' ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: captureFilter === 'PHONE_ONLY' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: captureFilter === 'PHONE_ONLY' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} color={captureFilter === 'PHONE_ONLY' ? '#8b5cf6' : 'currentColor'} />
                  Só fone
                </button>

                <button
                  type="button"
                  onClick={() => setCaptureFilter('PHONE_AND_WEB')}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: captureFilter === 'PHONE_AND_WEB' ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: captureFilter === 'PHONE_AND_WEB' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: captureFilter === 'PHONE_AND_WEB' ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={14} color={captureFilter === 'PHONE_AND_WEB' ? '#8b5cf6' : 'currentColor'} />
                  Fone + Site
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ———————————————————————————————————————————————————— */}
        {/* BOTÃO PRINCIPAL — BUSCAR LEADS */}
        {/* ———————————————————————————————————————————————————— */}
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: '16px 48px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isSearching ? 'wait' : 'pointer',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.55), 0 0 15px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {isSearching ? (
              <>
                <Loader2 size={20} className="spinner" />
                Procurando empresas na região...
              </>
            ) : (
              <>
                <Search size={20} />
                Buscar Oportunidades
              </>
            )}
          </button>
        </div>

        {/* ———————————————————————————————————————————————————— */}
        {/* SEÇÃO 4 — RESULTADOS / LISTA DE LEADS */}
        {/* ———————————————————————————————————————————————————— */}
        {hasSearched && (
          <section ref={resultsRef} className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
            
            {/* Se houver erro de busca */}
            {searchError ? (
              <div style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={24} color="#ef4444" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ef4444' }}>
                    Não foi possível carregar os resultados
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {searchError}
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Verifique os dados informados ou tente novamente em instantes.
                </div>
              </div>
            ) : (
              <>
                {/* Header da Lista */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{filteredLeads.length} leads encontrados • {discardedLeadsCount} descartados por ausência de contato</span>
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      {locationName} • {selectedNiches.length} {selectedNiches.length === 1 ? 'segmento selecionado' : 'segmentos selecionados'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ordenar por:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      >
                        <option value="relevance">Relevância</option>
                        <option value="rating">Maior Avaliação</option>
                        <option value="reviews">Mais Avaliações</option>
                        <option value="name">Nome (A-Z)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => exportCsv(false)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} />
                      Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Filtros Rápidos por Status */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {(['TODOS', 'Novo', 'Contatado', 'Qualificado', 'Descartado'] as const).map(st => {
                    const isCurrent = statusFilter === st;
                    const count = st === 'TODOS' ? leads.length : leads.filter(l => l.status === st).length;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: isCurrent ? 600 : 400,
                          border: isCurrent ? '1px solid #8b5cf6' : '1px solid var(--border-subtle)',
                          background: isCurrent ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                          color: isCurrent ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {st === 'TODOS' ? 'Todos' : st} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Barra de Ações em Lote */}
                {selectedLeadIds.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={paginatedLeads.every(l => selectedLeadIds.includes(l.id))}
                        onChange={() => toggleSelectAllPage(paginatedLeads)}
                        style={{ accentColor: '#8b5cf6', width: '16px', height: '16px' }}
                      />
                      <span>
                        <strong>{selectedLeadIds.length}</strong> {selectedLeadIds.length === 1 ? 'lead selecionado' : 'leads selecionados'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => exportCsv(true)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Exportar Selecionados
                      </button>

                      <button
                        type="button"
                        onClick={handleBatchAddToCrm}
                        disabled={batchAdding}
                        style={{
                          fontSize: '12px',
                          padding: '6px 16px',
                          background: '#10b981',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {batchAdding ? <Loader2 size={13} className="spinner" /> : <CheckCircle2 size={13} />}
                        Adicionar ao CRM em Lote
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Cards de Leads */}
                {filteredLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    Nenhum estabelecimento encontrado com os filtros selecionados para esta região.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
                    {paginatedLeads.map(lead => {
                      const isSelected = selectedLeadIds.includes(lead.id);

                      return (
                        <div
                          key={lead.id}
                          className="glass-card"
                          style={{
                            padding: '18px 20px',
                            borderRadius: '12px',
                            border: lead.addedToCrm
                              ? '1px solid rgba(16, 185, 129, 0.5)'
                              : isSelected
                                ? '1px solid rgba(139, 92, 246, 0.6)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                            background: lead.addedToCrm
                              ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 21, 35, 0.7) 100%)'
                              : 'var(--bg-glass-card)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '14px',
                            position: 'relative'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectLead(lead.id)}
                                  style={{ accentColor: '#8b5cf6', width: '16px', height: '16px', marginTop: '3px' }}
                                />
                                <div>
                                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                    {lead.name}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: 'rgba(139, 92, 246, 0.15)',
                                      color: '#a855f7',
                                      fontWeight: 600
                                    }}>
                                      {lead.category}
                                    </span>

                                    {/* Google Rating Real */}
                                    {lead.rating != null ? (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '11px',
                                        color: '#fbbf24',
                                        fontWeight: 600,
                                        background: 'rgba(245, 158, 11, 0.12)',
                                        padding: '2px 6px',
                                        borderRadius: '6px'
                                      }}>
                                        <Star size={11} fill="#fbbf24" />
                                        {lead.rating.toFixed(1)}
                                        {lead.reviewCount != null && (
                                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lead.reviewCount})</span>
                                        )}
                                      </span>
                                    ) : (
                                      <span style={{
                                        fontSize: '11px',
                                        color: 'var(--text-muted)',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        padding: '2px 6px',
                                        borderRadius: '6px'
                                      }}>
                                        Sem avaliações
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {lead.addedToCrm && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                  <CheckCircle2 size={12} />
                                  No CRM
                                </span>
                              )}
                            </div>

                            {/* Endereço Real */}
                            <p style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              margin: '8px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              lineHeight: 1.4
                            }}>
                              <MapPin size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                              {lead.address}
                            </p>

                            {/* Contatos reais com regras de exibição e links clicáveis */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0', fontSize: '12px' }}>
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#10b981',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                  }}
                                >
                                  <Mail size={13} />
                                  <span>{lead.email}</span>
                                </a>
                              )}

                              {lead.phone ? (
                                <a
                                  href={`tel:${lead.phone}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#38bdf8',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                  }}
                                >
                                  <Phone size={13} />
                                  <span>{lead.phone}</span>
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                  <Phone size={13} />
                                  <span>Sem telefone</span>
                                </span>
                              )}

                              {lead.website ? (
                                <a
                                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#a855f7',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                  }}
                                >
                                  <Globe size={13} />
                                  <span>{lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                                  <ExternalLink size={10} style={{ opacity: 0.7 }} />
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                  <Globe size={13} />
                                  <span>Sem site</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rodapé do Card */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.9)',
                                  border: '1px solid var(--border-subtle)',
                                  color: lead.status === 'Qualificado' ? '#10b981' : lead.status === 'Descartado' ? '#ef4444' : 'var(--text-primary)',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  outline: 'none',
                                  fontWeight: 600
                                }}
                              >
                                <option value="Novo">Novo</option>
                                <option value="Contatado">Contatado</option>
                                <option value="Qualificado">Qualificado</option>
                                <option value="Descartado">Descartado</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!lead.addedToCrm ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCrm(lead)}
                                  disabled={addingId === lead.id}
                                  style={{
                                    fontSize: '11px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: '#8b5cf6',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {addingId === lead.id ? (
                                    <Loader2 size={12} className="spinner" />
                                  ) : (
                                    <Building2 size={12} />
                                  )}
                                  Adicionar ao CRM
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  style={{
                                    fontSize: '11px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#10b981',
                                    fontWeight: 600,
                                    cursor: 'default',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Check size={12} />
                                  Adicionado
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleCreateProposal(lead)}
                                style={{
                                  fontSize: '11px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: 'var(--text-primary)',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FilePlus size={12} />
                                Criar Proposta
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </button>

                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Próxima
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}

          </section>
        )}

      </div>
    </div>
  );
};
export default ScannerView;
