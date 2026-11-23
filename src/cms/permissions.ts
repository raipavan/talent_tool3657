export type CmsRole = 'super_admin' | 'editor' | 'seo_manager' | 'reviewer';

export interface CmsUser {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  role: CmsRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export const ROLE_DETAILS: Record<CmsRole, { label: string; badgeColor: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    badgeColor: '#059669',
    description: 'Full administrative access across content, publishing, team roles, webhooks and security settings.',
  },
  editor: {
    label: 'Editor',
    badgeColor: '#0284c7',
    description: 'Can draft, preview, schedule, publish, edit pages, manage media and process incoming leads.',
  },
  seo_manager: {
    label: 'SEO Manager',
    badgeColor: '#7c3aed',
    description: 'Specialized access to per-page SEO, social previews, 301/302 redirects, sitemap, and external plugins.',
  },
  reviewer: {
    label: 'Reviewer',
    badgeColor: '#d97706',
    description: 'Read-only review & preview access. Can inspect draft changes but cannot publish live or modify settings.',
  },
};

export function canPublish(role?: CmsRole | string): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canEditContent(role?: CmsRole | string): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canManageSeo(role?: CmsRole | string): boolean {
  return role === 'super_admin' || role === 'editor' || role === 'seo_manager';
}

export function canManageMedia(role?: CmsRole | string): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canManageLeads(role?: CmsRole | string): boolean {
  return role === 'super_admin' || role === 'editor';
}

export function canManageUsers(role?: CmsRole | string): boolean {
  return role === 'super_admin';
}

export function canManageWebhooks(role?: CmsRole | string): boolean {
  return role === 'super_admin';
}
