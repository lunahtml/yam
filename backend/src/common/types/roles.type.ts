//backend/src/common/types/roles.type.ts
import { OrgRole } from '../../generated/prisma/enums.js';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

export const PRIVILEGED_ROLES: readonly WorkspaceRole[] = ['owner', 'admin'];
export const DESTRUCTIVE_ROLES: readonly WorkspaceRole[] = ['owner', 'admin'];
export const EDIT_ROLES: readonly WorkspaceRole[] = ['owner', 'admin', 'member'];

export const ORG_PRIVILEGED_ROLES: readonly OrgRole[] = ['OWNER', 'ADMIN'];