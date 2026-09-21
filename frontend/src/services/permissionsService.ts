export interface RolePermissions {
  can_view_leads: boolean;
  can_create_leads: boolean;
  can_edit_leads: boolean;
  can_delete_leads: boolean;
  can_assign_leads: boolean;
  can_view_companies: boolean;
  can_create_companies: boolean;
  can_edit_companies: boolean;
  can_delete_companies: boolean;
  can_view_campaigns: boolean;
  can_create_campaigns: boolean;
  can_view_agenda: boolean;
  can_create_agenda: boolean;
  can_view_analytics: boolean;
  can_view_sites: boolean;
  can_manage_sites: boolean;
  can_view_templates: boolean;
  can_manage_templates: boolean;
  can_export_data: boolean;
  can_invite_users: boolean;
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: RolePermissions;
}

export const ALL_PERMISSIONS_KEYS: { key: keyof RolePermissions; label: string; category: string }[] = [
  // Leads & Oportunidades
  { key: 'can_view_leads', label: 'Ver leads', category: 'Leads & Oportunidades' },
  { key: 'can_create_leads', label: 'Criar leads', category: 'Leads & Oportunidades' },
  { key: 'can_edit_leads', label: 'Editar leads', category: 'Leads & Oportunidades' },
  { key: 'can_delete_leads', label: 'Excluir leads', category: 'Leads & Oportunidades' },
  { key: 'can_assign_leads', label: 'Atribuir leads a outros usuários', category: 'Leads & Oportunidades' },

  // Empresas & Clientes
  { key: 'can_view_companies', label: 'Ver empresas', category: 'Empresas & Clientes' },
  { key: 'can_create_companies', label: 'Criar empresas', category: 'Empresas & Clientes' },
  { key: 'can_edit_companies', label: 'Editar empresas', category: 'Empresas & Clientes' },
  { key: 'can_delete_companies', label: 'Excluir empresas', category: 'Empresas & Clientes' },

  // Campanhas
  { key: 'can_view_campaigns', label: 'Ver campanhas', category: 'Campanhas' },
  { key: 'can_create_campaigns', label: 'Criar campanhas', category: 'Campanhas' },

  // Agenda
  { key: 'can_view_agenda', label: 'Ver agenda', category: 'Agenda' },
  { key: 'can_create_agenda', label: 'Criar compromissos', category: 'Agenda' },

  // Analytics & Gestão
  { key: 'can_view_analytics', label: 'Ver analytics', category: 'Analytics & Gestão' },
  { key: 'can_export_data', label: 'Exportar dados', category: 'Analytics & Gestão' },
  { key: 'can_invite_users', label: 'Convidar usuários', category: 'Analytics & Gestão' },

  // Sites & Templates
  { key: 'can_view_sites', label: 'Ver sites', category: 'Sites & Templates' },
  { key: 'can_manage_sites', label: 'Gerenciar sites', category: 'Sites & Templates' },
  { key: 'can_view_templates', label: 'Ver templates', category: 'Sites & Templates' },
  { key: 'can_manage_templates', label: 'Gerenciar templates', category: 'Sites & Templates' },
];

const ADMIN_PERMISSIONS: RolePermissions = {
  can_view_leads: true,
  can_create_leads: true,
  can_edit_leads: true,
  can_delete_leads: true,
  can_assign_leads: true,
  can_view_companies: true,
  can_create_companies: true,
  can_edit_companies: true,
  can_delete_companies: true,
  can_view_campaigns: true,
  can_create_campaigns: true,
  can_view_agenda: true,
  can_create_agenda: true,
  can_view_analytics: true,
  can_view_sites: true,
  can_manage_sites: true,
  can_view_templates: true,
  can_manage_templates: true,
  can_export_data: true,
  can_invite_users: true,
};

const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'ADMIN',
    name: 'Admin',
    description: 'Acesso irrestrito a todas as funcionalidades do sistema. Cargo intocável.',
    isSystem: true,
    permissions: ADMIN_PERMISSIONS
  },
  {
    id: 'GERENTE',
    name: 'Gerente',
    description: 'Supervisão de equipe comercial, campanhas, metas e distribuição de oportunidades.',
    permissions: {
      ...ADMIN_PERMISSIONS,
      can_delete_companies: false,
      can_manage_sites: false
    }
  },
  {
    id: 'VENDEDOR',
    name: 'Vendedor',
    description: 'Gestão de oportunidades próprias, atualização de pipeline e agenda de reuniões.',
    permissions: {
      can_view_leads: true,
      can_create_leads: true,
      can_edit_leads: true,
      can_delete_leads: false,
      can_assign_leads: false,
      can_view_companies: true,
      can_create_companies: true,
      can_edit_companies: true,
      can_delete_companies: false,
      can_view_campaigns: true,
      can_create_campaigns: false,
      can_view_agenda: true,
      can_create_agenda: true,
      can_view_analytics: true,
      can_view_sites: false,
      can_manage_sites: false,
      can_view_templates: false,
      can_manage_templates: false,
      can_export_data: false,
      can_invite_users: false,
    }
  },
  {
    id: 'SDR',
    name: 'SDR',
    description: 'Prospecção e qualificação inicial de leads para passagem de bastão aos vendedores.',
    permissions: {
      can_view_leads: true,
      can_create_leads: true,
      can_edit_leads: true,
      can_delete_leads: false,
      can_assign_leads: true,
      can_view_companies: true,
      can_create_companies: true,
      can_edit_companies: true,
      can_delete_companies: false,
      can_view_campaigns: true,
      can_create_campaigns: false,
      can_view_agenda: true,
      can_create_agenda: true,
      can_view_analytics: true,
      can_view_sites: false,
      can_manage_sites: false,
      can_view_templates: false,
      can_manage_templates: false,
      can_export_data: false,
      can_invite_users: false,
    }
  },
  {
    id: 'VIEWER',
    name: 'Viewer',
    description: 'Visualização de dados do CRM sem permissão de edição ou exclusão.',
    permissions: {
      can_view_leads: true,
      can_create_leads: false,
      can_edit_leads: false,
      can_delete_leads: false,
      can_assign_leads: false,
      can_view_companies: true,
      can_create_companies: false,
      can_edit_companies: false,
      can_delete_companies: false,
      can_view_campaigns: true,
      can_create_campaigns: false,
      can_view_agenda: true,
      can_create_agenda: false,
      can_view_analytics: true,
      can_view_sites: false,
      can_manage_sites: false,
      can_view_templates: false,
      can_manage_templates: false,
      can_export_data: false,
      can_invite_users: false,
    }
  }
];

const STORAGE_KEY = 'lumeo_crm_roles_config';

class PermissionsService {
  private roles: RoleConfig[] = [];

  constructor() {
    this.loadRoles();
  }

  private loadRoles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Garante que o ADMIN sempre tenha todas as permissões ativas
          this.roles = parsed.map(r => {
            if (r.id === 'ADMIN') {
              return { ...r, isSystem: true, permissions: { ...ADMIN_PERMISSIONS } };
            }
            return r;
          });
          return;
        }
      }
    } catch {
      // Ignora erro de parse
    }
    this.roles = DEFAULT_ROLES;
    this.saveRoles();
  }

  private saveRoles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.roles));
      window.dispatchEvent(new CustomEvent('lumeo_permissions_changed', { detail: this.roles }));
    } catch {
      // Ignora erro de storage
    }
  }

  public getRoles(): RoleConfig[] {
    return [...this.roles];
  }

  public getRole(roleId?: string): RoleConfig | undefined {
    if (!roleId) return undefined;
    const clean = roleId.toUpperCase().trim();
    return this.roles.find(r => r.id.toUpperCase() === clean);
  }

  public hasPermission(roleId: string | undefined, permissionKey: keyof RolePermissions): boolean {
    if (!roleId) return false;
    const normalized = roleId.toUpperCase().trim();
    // ADMIN É INTOCÁVEL: tem todas as permissões sempre ativas
    if (normalized === 'ADMIN') return true;

    const role = this.getRole(normalized);
    if (!role) return false;
    return Boolean(role.permissions[permissionKey]);
  }

  public updatePermissions(roleId: string, updatedPermissions: Partial<RolePermissions>) {
    const normalized = roleId.toUpperCase().trim();
    // Admin não pode ser restringido
    if (normalized === 'ADMIN') return;

    this.roles = this.roles.map(r => {
      if (r.id.toUpperCase() === normalized) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            ...updatedPermissions
          }
        };
      }
      return r;
    });

    this.saveRoles();
  }

  public createRole(name: string, description?: string): RoleConfig {
    const slug = name.toUpperCase().trim().replace(/[^A-Z0-9]/g, '_');
    const existing = this.getRole(slug);
    if (existing) return existing;

    const newRole: RoleConfig = {
      id: slug,
      name: name.trim(),
      description: description || `Cargo customizado: ${name.trim()}`,
      permissions: {
        can_view_leads: true,
        can_create_leads: true,
        can_edit_leads: true,
        can_delete_leads: false,
        can_assign_leads: false,
        can_view_companies: true,
        can_create_companies: true,
        can_edit_companies: false,
        can_delete_companies: false,
        can_view_campaigns: true,
        can_create_campaigns: false,
        can_view_agenda: true,
        can_create_agenda: true,
        can_view_analytics: false,
        can_view_sites: false,
        can_manage_sites: false,
        can_view_templates: false,
        can_manage_templates: false,
        can_export_data: false,
        can_invite_users: false,
      }
    };

    this.roles.push(newRole);
    this.saveRoles();
    return newRole;
  }

  public deleteRole(roleId: string): boolean {
    const normalized = roleId.toUpperCase().trim();
    // ADMIN não pode ser excluído
    if (normalized === 'ADMIN') return false;

    this.roles = this.roles.filter(r => r.id.toUpperCase() !== normalized);
    this.saveRoles();
    return true;
  }
}

export const permissionsService = new PermissionsService();
