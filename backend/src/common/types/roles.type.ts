//backend\src\common\types\roles.type.ts
export const PROJECT_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
} as const;

export type ProjectRole = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES];

/**
 * Роли, которые НЕ МОГУТ быть понижены через ProjectMember.
 * owner/admin воркспейса всегда сохраняют свой уровень.
 */
export const PRIVILEGED_ROLES: readonly ProjectRole[] = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
];

export const DESTRUCTIVE_ROLES: readonly ProjectRole[] = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
];

export const EDIT_ROLES: readonly ProjectRole[] = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
    PROJECT_ROLES.MEMBER,
];