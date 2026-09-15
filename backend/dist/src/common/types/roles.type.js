//backend\src\common\types\roles.type.ts
export const PROJECT_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
};
/**
 * Роли, которые НЕ МОГУТ быть понижены через ProjectMember.
 * owner/admin воркспейса всегда сохраняют свой уровень.
 */
export const PRIVILEGED_ROLES = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
];
export const DESTRUCTIVE_ROLES = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
];
export const EDIT_ROLES = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.ADMIN,
    PROJECT_ROLES.MEMBER,
];
//# sourceMappingURL=roles.type.js.map