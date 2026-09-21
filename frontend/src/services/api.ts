// Cliente HTTP centralizado e integração com a API REST do CRM LeadScope
const rawApiUrl = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '';
const urlMatch = rawApiUrl.match(/https?:\/\/[a-zA-Z0-9.-]+(:\d+)?/);
const isBrowser = typeof window !== 'undefined';
const isVercel = isBrowser && window.location.hostname.includes('vercel.app');
const BASE_URL = urlMatch
  ? `${urlMatch[0]}/api`
  : (isVercel ? 'https://leadscope-e8lo.onrender.com/api' : '/api');

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  active?: boolean;
  createdAt?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface Company {
  id: number;
  cnpj?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  segmento?: string;
  porte?: string;
  telefone?: string;
  email?: string;
  website?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  source: string;
  active: boolean;
  isClient: boolean;
  clientSince?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStatus {
  id: number;
  name: string;
  orderIndex: number;
  color: string;
  isDefault: boolean;
  isWon: boolean;
  isLost: boolean;
}

export interface Lead {
  id: number;
  code?: string;
  companyId: number;
  companyName?: string;
  companyRazaoSocial: string;
  companyNomeFantasia?: string;
  companyCnpj?: string;
  companySegmento?: string;
  companyTelefone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyCidade?: string;
  companyEstado?: string;
  statusId: number;
  statusName: string;
  statusColor: string;
  assignedToId?: number;
  assignedToName?: string;
  ownerName?: string;
  title: string;
  description?: string;
  value?: number;
  score?: number;
  phone?: string;
  website?: string;
  expectedClose?: string;
  priority: string;
  source: string;
  siteId?: number;
  siteName?: string;
  acceptanceChance?: number;
  costOfLiving?: number;
  locationPotential?: string;
  scoreRationale?: string;
  websiteContentSummary?: string;
  googleRating?: number | null;
  googleReviewsCount?: number | null;
  rating?: number | null;
  regionTier?: string | null;
  digitalPresenceTier?: string | null;
  createdById: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoScanSettings {
  id: number;
  active: boolean;
  scheduledTime: string;
  leadsPerDay: number;
  minAcceptanceScore: number;
  locationTier: 'ALTO' | 'MEDIO' | 'QUALQUER' | string;
  discardedLeadsCount: number;
  updatedAt?: string;
}

export interface RegionStat {
  region: string;
  totalLeads: number;
  avgScore: number;
  socioEconomicTier: string;
}

export interface AutoScanAnalytics {
  settings: AutoScanSettings;
  totalLeads: number;
  totalAccepted: number;
  discardedCount: number;
  averageScore: number;
  todayAvgScore: number;
  todayLeadsCount: number;
  scoreDistribution: Record<string, number>;
  topRegions: RegionStat[];
}

export interface UserSettingsDto {
  userId?: number;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  theme?: string;
  language?: string;
  notifyNewLead?: boolean;
  notifyNewAppointment?: boolean;
  notifyDailySummary?: boolean;
}

export interface Site {
  id: number;
  name: string;
  clientName?: string;
  url: string;
  thumbnail?: string;
  deliveryDate?: string;
  status?: 'Online' | 'Em desenvolvimento' | 'Em manutenção';
  slug?: string;
  webhookUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteEmailTemplate {
  id: number;
  siteId: number;
  siteName?: string;
  name: string;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InviteUserRequest {
  email: string;
  name?: string;
  role: string;
}

export interface LeadNote {
  id: number;
  leadId: number;
  userId?: number;
  authorName: string;
  content: string;
  isStatusChange: boolean;
  createdAt: string;
}

export interface DailyScanStatus {
  leadsToday: number;
  dailyTarget: number;
  autoScanActive: boolean;
  lastRun: string;
  scheduleDescription: string;
}

export interface Agreement {
  id: number;
  companyId?: number;
  leadId?: number;
  companyName?: string;
  clientName?: string;
  clientEmail?: string;
  title?: string;
  value?: number;
  terms?: string;
  termContent: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED';
  acceptedByName?: string;
  acceptedAt?: string;
  ipAddress?: string;
  acceptedIp?: string;
  userAgent?: string;
  contentSha256?: string;
  acceptedHash?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementCreateRequest {
  clientId?: number;
  companyId?: number;
  leadId?: number;
  clientName?: string;
  clientEmail?: string;
  title?: string;
  value?: number;
  termContent: string;
  terms?: string;
}

export interface AgreementAcceptRequest {
  fullName?: string;
  signerName?: string;
}

export interface Activity {
  id: number;
  leadId: number;
  leadTitle: string;
  userId: number;
  userName: string;
  type: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  doneAt?: string;
  createdAt: string;
}

export interface Proposal {
  id: number;
  leadId: number;
  leadTitle: string;
  companyId: number;
  companyRazaoSocial: string;
  title: string;
  value: number;
  status: string;
  validUntil?: string;
  items?: Record<string, any>;
  notes?: string;
  createdById: number;
  createdByName: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface CnpjLookup {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  segmento?: string;
  porte?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cnae?: string;
  cnaeDescricao?: string;
  situacaoCadastral?: string;
  alreadyExists: boolean;
  existingCompanyId?: number;
}

export interface ScannerJob {
  id: number;
  name: string;
  status: string;
  source: string;
  filterState?: string;
  filterCity?: string;
  filterCnae?: string;
  filterPorte?: string;
  totalFound: number;
  totalImported: number;
  totalSkipped: number;
  startedByName?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface ScannerJobItem {
  id: number;
  jobId: number;
  cnpj?: string;
  razaoSocial?: string;
  status: string;
  companyId?: number;
  errorMessage?: string;
  rawData?: Record<string, any>;
}

export interface PlaceLead {
  placeId: string;
  name: string;
  category: string;
  formattedAddress: string;
  formattedPhoneNumber: string | null;
  website: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  businessStatus: string | null;
  latitude: number | null;
  longitude: number | null;
  email?: string | null;
}

export interface PlaceSearchResponse {
  leads: PlaceLead[];
  totalFound: number;
  discardedCount: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Contract {
  id: number;
  companyId?: number;
  leadId?: number;
  proposalId?: number;
  companyName?: string;
  templateName: string;
  templateType?: string;
  recipientName?: string;
  signerName?: string;
  recipientEmail?: string;
  signerEmail?: string;
  recipientPhone?: string;
  signerPhone?: string;
  status: 'PENDING' | 'SIGNED' | 'COMPLETED' | 'REJECTED';
  documentUrl?: string;
  signingUrl?: string;
  docusealSubmissionId?: string;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  signedAt?: string;
  rejectedAt?: string;
}

export interface ContractRequest {
  companyId?: number;
  leadId?: number;
  templateName: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  signerName?: string;
  signerEmail?: string;
  signerPhone?: string;
  templateType?: string;
  value?: number;
  customTerms?: string;
}

export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  performedBy?: number;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('crm_auth_token') ||
    sessionStorage.getItem('crm_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  // Permite até 75s para rotas de autenticação (devido a cold start do Render) e 45s para outras
  const timeoutMs = endpoint.startsWith('/auth') ? 75000 : 45000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`O servidor na nuvem demorou para responder (cold start). Por favor, tente novamente.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && !endpoint.startsWith('/auth')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_user_info');
    sessionStorage.removeItem('crm_auth_token');
    sessionStorage.removeItem('crm_user_info');
    window.dispatchEvent(new CustomEvent('leadscope_auth_expired'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `Erro na requisição: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string; confirmPassword?: string }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    acceptInvite: (data: { email: string; password: string }) =>
      request<AuthResponse>('/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<UserInfo>('/auth/me'),
  },

  companies: {
    list: (params?: { search?: string; estado?: string; segmento?: string; active?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.estado) query.append('estado', params.estado);
      if (params?.segmento) query.append('segmento', params.segmento);
      if (params?.active !== undefined) query.append('active', String(params.active));
      return request<{ content: Company[] }>(`/companies?${query.toString()}`);
    },
    getById: (id: number) => request<Company>(`/companies/${id}`),
    create: (data: Partial<Company>) =>
      request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Company>) =>
      request<Company>(`/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/companies/${id}`, {
        method: 'DELETE',
      }),
    toggleStatus: (id: number) =>
      request<Company>(`/companies/${id}/toggle-status`, {
        method: 'PATCH',
      }),
  },

  leadStatuses: {
    list: () => request<LeadStatus[]>('/lead-statuses'),
  },

  leads: {
    list: (params?: { search?: string; statusId?: number; priority?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.statusId) query.append('statusId', String(params.statusId));
      if (params?.priority) query.append('priority', params.priority);
      return request<{ content: Lead[] }>(`/leads?${query.toString()}`);
    },
    getById: (id: number) => request<Lead>(`/leads/${id}`),
    create: (data: any) =>
      request<Lead>('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Lead>) =>
      request<Lead>(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, statusId: number) =>
      request<Lead>(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ statusId }),
      }),
    changeStatus: (id: number, statusId: number, notes?: string) =>
      request<Lead>(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ statusId, notes }),
      }),
    assign: (id: number, vendorId?: number | null) =>
      request<Lead>(`/leads/${id}/assign/${vendorId || 0}`, {
        method: 'PATCH',
      }),
    delete: (id: number) =>
      request<void>(`/leads/${id}`, {
        method: 'DELETE',
      }),
    batchDelete: (ids: number[]) =>
      request<void>('/leads/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    listNotes: (leadId: number) => request<LeadNote[]>(`/leads/${leadId}/notes`),
    addNote: (leadId: number, content: string) =>
      request<LeadNote>(`/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    runAgent: () =>
      request<{ status: string; processed: number; message: string }>('/leads/agent/run', {
        method: 'POST',
      }),
    transfer: (id: number, targetUserId: number, reason?: string) =>
      request<Lead>(`/leads/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId, reason }),
      }),
    sendToUser: (id: number, targetUserId: number, note?: string) =>
      request<Lead>(`/leads/${id}/send`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId, note }),
      }),
    autoScanDaily: async () => {
      try {
        return await request<Lead[]>('/leads/auto-scan-daily', {
          method: 'POST',
        });
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('POST') || msg.includes('405') || msg.includes('Method parameter') || msg.includes('Failed to convert')) {
          return await request<Lead[]>('/leads/auto-scan-daily', {
            method: 'GET',
          });
        }
        throw err;
      }
    },
    getDailyScanStatus: () =>
      request<DailyScanStatus>('/leads/auto-scan-status'),
    getAutoScanSettings: () =>
      request<AutoScanSettings>('/leads/auto-scan-settings'),
    updateAutoScanSettings: async (data: Partial<AutoScanSettings>) => {
      try {
        return await request<AutoScanSettings>('/leads/auto-scan-settings', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('POST') || msg.includes('405') || msg.includes('not supported')) {
          return await request<AutoScanSettings>('/leads/auto-scan-settings', {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        }
        throw err;
      }
    },
    enrichWebsite: (id: number, website?: string) =>
      request<Lead>(`/leads/${id}/enrich-website`, {
        method: 'POST',
        body: JSON.stringify({ website }),
      }),
    getAutoScanAnalytics: () =>
      request<AutoScanAnalytics>('/leads/auto-scan-analytics'),
    getSchedule: () =>
      request<{ hour: number; minute: number; active: boolean; timeString: string; formattedDescription: string }>('/leads/auto-scan-schedule'),
    updateSchedule: (data: { time: string; active?: boolean }) =>
      request<{ hour: number; minute: number; active: boolean; timeString: string; formattedDescription: string }>('/leads/auto-scan-schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  activities: {
    listByLead: (leadId: number) => request<Activity[]>(`/activities/lead/${leadId}`),
    listUpcoming: () => request<Activity[]>('/activities/upcoming'),
    create: (data: { leadId: number; type: string; title: string; description?: string; scheduledAt?: string }) =>
      request<Activity>('/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    markDone: (id: number) =>
      request<Activity>(`/activities/${id}/done`, {
        method: 'PATCH',
      }),
    delete: (id: number) =>
      request<void>(`/activities/${id}`, {
        method: 'DELETE',
      }),
  },

  proposals: {
    listAll: () => request<Proposal[]>('/proposals'),
    list: (leadId?: number) => {
      const query = leadId ? `?leadId=${leadId}` : '';
      return request<{ content: Proposal[] }>(`/proposals${query}`);
    },
    listByLead: (leadId: number) => request<Proposal[]>(`/proposals/lead/${leadId}`),
    getById: (id: number) => request<Proposal>(`/proposals/${id}`),
    create: (data: Partial<Proposal> & { leadId: number; title: string; value: number; validUntil?: string; notes?: string }) =>
      request<Proposal>('/proposals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    send: (id: number) =>
      request<Proposal>(`/proposals/${id}/send`, {
        method: 'PATCH',
      }),
    accept: (id: number) =>
      request<Proposal>(`/proposals/${id}/accept`, {
        method: 'PATCH',
      }),
    reject: (id: number) =>
      request<Proposal>(`/proposals/${id}/reject`, {
        method: 'PATCH',
      }),
    delete: (id: number) =>
      request<void>(`/proposals/${id}`, {
        method: 'DELETE',
      }),
  },

  scanner: {
    lookupCnpj: (cnpj: string) => request<CnpjLookup>(`/scanner/lookup/${cnpj}`),
    createJob: (data: { name: string; filterState?: string; filterCity?: string; filterCnae?: string; filterPorte?: string; autoImport?: boolean; autoCreateLead?: boolean }) =>
      request<ScannerJob>('/scanner/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listJobs: () => request<{ content: ScannerJob[] }>('/scanner/jobs'),
    getJobItems: (jobId: number) => request<{ content: ScannerJobItem[] }>(`/scanner/jobs/${jobId}/items`),
    importItem: (itemId: number, createLead: boolean = true) =>
      request<ScannerJobItem>(`/scanner/items/${itemId}/import?createLead=${createLead}`, {
        method: 'POST',
      }),
    importAll: (jobId: number, createLeads: boolean = true) =>
      request<ScannerJob>(`/scanner/jobs/${jobId}/import?createLeads=${createLeads}`, {
        method: 'POST',
      }),
    searchPlaces: (data: {
      latitude: number;
      longitude: number;
      radius?: number;
      categories: string[];
      captureFilter?: string;
      source?: string;
    }) =>
      request<PlaceSearchResponse>('/scanner/places/search', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  audit: {
    list: () => request<{ content: AuditLog[] }>('/audit'),
  },

  users: {
    listVendors: () => request<UserInfo[]>('/users/vendors'),
    listAll: async () => {
      try {
        const res = await request<any>('/users');
        const list = (Array.isArray(res) ? res : (res?.content || [])) as UserInfo[];
        if (list.length > 0) {
          localStorage.setItem('lumeo_cached_users', JSON.stringify(list));
          return list;
        }
      } catch (err: any) {}
      const cached = localStorage.getItem('lumeo_cached_users');
      if (cached) {
        try {
          return JSON.parse(cached) as UserInfo[];
        } catch {}
      }
      return [
        {
          id: 1,
          name: 'Gabriel Castro',
          email: 'gabrielcastro.dev01@gmail.com',
          role: 'ADMIN',
          active: true,
          status: 'ACTIVE'
        }
      ];
    },
    listPending: () => request<UserInfo[]>('/users/pending'),
    countPending: () => request<number>('/users/pending/count'),
    approve: (id: number) =>
      request<UserInfo>(`/users/${id}/approve`, {
        method: 'POST',
      }),
    reject: (id: number) =>
      request<UserInfo>(`/users/${id}/reject`, {
        method: 'POST',
      }),
    updateRole: (id: number, role: string) =>
      request<UserInfo>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    delete: (id: number) =>
      request<void>(`/users/${id}`, {
        method: 'DELETE',
      }),
    create: (data: { name: string; email: string; password: string; role?: string }) =>
      request<UserInfo>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    invite: (data: InviteUserRequest) =>
      request<UserInfo>('/users/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  sites: {
    list: async (): Promise<Site[]> => {
      try {
        const data = await request<Site[]>('/sites');
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('lumeo_cached_sites', JSON.stringify(data));
          return data;
        }
      } catch (err: any) {}
      const cached = localStorage.getItem('lumeo_cached_sites');
      if (cached) {
        try {
          return JSON.parse(cached) as Site[];
        } catch {}
      }
      const initialSites: Site[] = [
        {
          id: 1,
          name: 'Portal Dra. Camila Silveira Odontologia',
          clientName: 'Dra. Camila Silveira',
          url: 'https://dracamilasilveira.com.br',
          thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
          deliveryDate: '2026-08-15',
          status: 'Online',
          createdAt: '2026-08-15T10:00:00Z',
        },
        {
          id: 2,
          name: 'Advocacia & Consultoria Jurídica Rocha',
          clientName: 'Dr. Roberto Rocha',
          url: 'https://rochajuridico.adv.br',
          thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
          deliveryDate: '2026-09-02',
          status: 'Online',
          createdAt: '2026-09-02T10:00:00Z',
        },
        {
          id: 3,
          name: 'Studio Arquitetura & Interiores Forma',
          clientName: 'Mariana Duarte Arquitetura',
          url: 'https://formaarquitetura.com.br',
          thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
          deliveryDate: '2026-09-18',
          status: 'Em desenvolvimento',
          createdAt: '2026-09-18T10:00:00Z',
        }
      ];
      localStorage.setItem('lumeo_cached_sites', JSON.stringify(initialSites));
      return initialSites;
    },
    get: (id: number) => request<Site>(`/sites/${id}`),
    create: async (data: Partial<Site>): Promise<Site> => {
      let created: Site | null = null;
      try {
        created = await request<Site>('/sites', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (err) {}
      const current = await api.sites.list();
      const siteItem: Site = created || {
        id: Date.now(),
        name: data.name || 'Novo Site',
        clientName: data.clientName || 'Cliente',
        url: data.url || '',
        thumbnail: data.thumbnail || '',
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Online',
        active: true,
        createdAt: new Date().toISOString()
      };
      const updated = [siteItem, ...current.filter(s => s.id !== siteItem.id)];
      localStorage.setItem('lumeo_cached_sites', JSON.stringify(updated));
      return siteItem;
    },
    update: async (id: number, data: Partial<Site>): Promise<Site> => {
      let updatedRes: Site | null = null;
      try {
        updatedRes = await request<Site>(`/sites/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (err) {}
      const current = await api.sites.list();
      const updatedList = current.map(s => s.id === id ? { ...s, ...(updatedRes || data) } : s);
      localStorage.setItem('lumeo_cached_sites', JSON.stringify(updatedList));
      return updatedList.find(s => s.id === id)!;
    },
    delete: async (id: number): Promise<void> => {
      try {
        await request<void>(`/sites/${id}`, { method: 'DELETE' });
      } catch (err) {}
      const current = await api.sites.list();
      const updatedList = current.filter(s => s.id !== id);
      localStorage.setItem('lumeo_cached_sites', JSON.stringify(updatedList));
    },
    listAllTemplates: async (): Promise<SiteEmailTemplate[]> => {
      try {
        const data = await request<SiteEmailTemplate[]>('/sites/all-templates');
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('lumeo_cached_templates', JSON.stringify(data));
          return data;
        }
      } catch (err) {}
      const cached = localStorage.getItem('lumeo_cached_templates');
      if (cached) {
        try {
          return JSON.parse(cached) as SiteEmailTemplate[];
        } catch {}
      }
      const initialTemplates: SiteEmailTemplate[] = [
        {
          id: 1,
          siteId: 1,
          siteName: 'LeadScope Landing Page Principal',
          name: 'Boas-Vindas & Qualificação Imediata',
          triggerEvent: 'LEAD_CAPTURED',
          subject: 'Recebemos seu contato - LeadScope Inteligência Comercial',
          bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Recebemos seus dados através de {{site_name}}.</p><p>Um de nossos especialistas entrará em contato em breve.</p>',
          active: true,
          createdAt: '2026-09-20T10:00:00Z',
        },
        {
          id: 2,
          siteId: 1,
          siteName: 'LeadScope Landing Page Principal',
          name: 'Apresentação Comercial & Agendamento',
          triggerEvent: 'STATUS_CHANGED',
          subject: 'Sua demonstração exclusiva da plataforma LeadScope',
          bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Identificamos um forte alinhamento com seu negócio.</p><p>Acesse o link para escolher o melhor horário de demonstração.</p>',
          active: true,
          createdAt: '2026-09-20T10:00:00Z',
        },
        {
          id: 3,
          siteId: 2,
          siteName: 'Portal Corporativo B2B',
          name: 'Follow-up de Proposta Comercial',
          triggerEvent: 'LEAD_CAPTURED',
          subject: 'Proposta Corporativa LeadScope B2B',
          bodyHtml: '<h2>Prezado(a) {{lead_name}},</h2><p>Agradecemos o interesse em nossas soluções corporativas.</p>',
          active: true,
          createdAt: '2026-09-20T10:00:00Z',
        }
      ];
      localStorage.setItem('lumeo_cached_templates', JSON.stringify(initialTemplates));
      return initialTemplates;
    },
    listTemplates: async (siteId: number): Promise<SiteEmailTemplate[]> => {
      try {
        const data = await request<SiteEmailTemplate[]>(`/sites/${siteId}/templates`);
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      const all = await api.sites.listAllTemplates();
      return all.filter(t => t.siteId === siteId);
    },
    createTemplate: async (siteId: number, data: Partial<SiteEmailTemplate>): Promise<SiteEmailTemplate> => {
      let created: SiteEmailTemplate | null = null;
      try {
        created = await request<SiteEmailTemplate>(`/sites/${siteId}/templates`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (err) {}
      const all = await api.sites.listAllTemplates();
      const sites = await api.sites.list();
      const site = sites.find(s => s.id === siteId);
      const tplItem: SiteEmailTemplate = created || {
        id: Date.now(),
        siteId,
        siteName: site?.name || `Site #${siteId}`,
        name: data.name || 'Novo Template',
        triggerEvent: data.triggerEvent || 'LEAD_CAPTURED',
        subject: data.subject || '',
        bodyHtml: data.bodyHtml || '',
        active: data.active ?? true,
        createdAt: new Date().toISOString()
      };
      const updated = [tplItem, ...all.filter(t => t.id !== tplItem.id)];
      localStorage.setItem('lumeo_cached_templates', JSON.stringify(updated));
      return tplItem;
    },
    updateTemplate: async (siteId: number, templateId: number, data: Partial<SiteEmailTemplate>): Promise<SiteEmailTemplate> => {
      let updatedRes: SiteEmailTemplate | null = null;
      try {
        updatedRes = await request<SiteEmailTemplate>(`/sites/${siteId}/templates/${templateId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (err) {}
      const all = await api.sites.listAllTemplates();
      const updated = all.map(t => t.id === templateId ? { ...t, ...(updatedRes || data) } : t);
      localStorage.setItem('lumeo_cached_templates', JSON.stringify(updated));
      return updated.find(t => t.id === templateId)!;
    },
    deleteTemplate: async (siteId: number, templateId: number): Promise<void> => {
      try {
        await request<void>(`/sites/${siteId}/templates/${templateId}`, { method: 'DELETE' });
      } catch (err) {}
      const all = await api.sites.listAllTemplates();
      const updated = all.filter(t => t.id !== templateId);
      localStorage.setItem('lumeo_cached_templates', JSON.stringify(updated));
    }
  },

  notifications: {
    list: () => request<NotificationItem[]>('/notifications'),
    unreadCount: () => request<number>('/notifications/unread-count'),
    markAsRead: (id: number) =>
      request<void>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      request<void>('/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  contracts: {
    send: (data: ContractRequest) =>
      request<Contract>('/contracts/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => request<Contract[]>('/contracts'),
    get: (id: number) => request<Contract>(`/contracts/${id}`),
    listByCompany: (companyId: number) => request<Contract[]>(`/contracts/company/${companyId}`),
    listByProposal: (proposalId: number) => request<Contract[]>(`/contracts/proposal/${proposalId}`),
    simulateSign: (id: number) =>
      request<Contract>(`/contracts/${id}/simulate-sign`, {
        method: 'POST',
      }),
  },

  agreements: {
    create: (data: AgreementCreateRequest) =>
      request<Agreement>('/agreements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByToken: (token: string) => request<Agreement>(`/agreements/${token}`),
    accept: (token: string, data: AgreementAcceptRequest) =>
      request<Agreement>(`/agreements/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listByClient: (clientId: number) => request<Agreement[]>(`/agreements/client/${clientId}`),
    listByLead: (leadId: number) => request<Agreement[]>(`/agreements/lead/${leadId}`),
  },

  settings: {
    getMySettings: () => request<UserSettingsDto>('/settings/me'),
    saveMySettings: (data: Partial<UserSettingsDto>) =>
      request<UserSettingsDto>('/settings/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/settings/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    revokeSessions: () =>
      request<{ message: string }>('/settings/revoke-sessions', {
        method: 'POST',
      }),
  },
};
