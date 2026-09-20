const BASE_URL = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '') + '/api';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  active?: boolean;
  createdAt?: string;
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
  createdById: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
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
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || (response.status === 403 && !endpoint.includes('/auth/login'))) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
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
    assign: (id: number, vendorId: number) =>
      request<Lead>(`/leads/${id}/assign/${vendorId}`, {
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
      const res = await request<any>('/users');
      return (Array.isArray(res) ? res : (res?.content || [])) as UserInfo[];
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
};
