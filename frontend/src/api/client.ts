//frontend\src\api\client.ts
const API_BASE = '/api';
import {
    Organization,
    Workspace,
    Project,
    Artifact,
    ArtifactType,
    UtmSource,
    UtmMedium,
    UtmCampaign,
    UtmRule,
    UtmRuleCondition,
    UtmLink,
    DashboardForm,
    DashboardHistoryItem,
    Entity,
    Field,
    FieldType,
    FieldTypeInfo,
    EntityRecord,
    RecordsResponse,
    ListRecordsQuery,
    View,
    ViewType,
    EntityTemplate,
    Sprint,
    SprintMetric,
    SprintEvent,
    Increment,
    User,
    Category,
    CategoryScope,
    Tag,
    Skill,
    SkillType,
    UserSkill,
    EvidenceType,
    ProjectMember,
    Invitation,
    Epic,
    EpicStatus,
    // Workflow,
    // WorkflowStep,
} from '../types/api';

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'fetch',
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    // ДОБАВЛЕНО: если access-токен протух (401) — пробуем один раз тихо
    // обновить его через refresh-cookie и повторить исходный запрос.
    // Не трогаем сами /auth/* эндпоинты, чтобы не зациклиться на refresh/login.
    if (res.status === 401 && !path.startsWith('/auth/')) {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'X-Requested-With': 'fetch' },
        });
        console.log('[AUTH] Refresh attempt:', refreshRes.status);
        if (refreshRes.ok) {
            const retryRes = await fetch(`${API_BASE}${path}`, {
                ...options,
                headers,
                credentials: 'include',
            });
            const retryText = await retryRes.text();
            const retryData = retryText ? JSON.parse(retryText) : null;

            if (!retryRes.ok) {
                throw new Error(retryData?.message || 'Request failed');
            }
            console.log('[AUTH] Refresh OK, retrying:', path);
            return retryData;
        }

        // refresh тоже не прошёл — сессия реально кончилась (например, logout
        // на другом устройстве или refresh-токен истёк через 30 дней)
        console.warn('[AUTH] Session expired, redirecting to login');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/';
        throw new Error('Session expired');
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.message || 'Request failed');
    }

    return data;
}

export const api = {
    register: (email: string, password: string, name?: string) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),
    getMySessions: () => request('/sessions'),
    verifyEmail: (verificationToken: string, code: string) =>
        request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ verificationToken, code }),
        }),

    login: (email: string, password: string) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    verifyLogin: (verificationToken: string, code: string) =>
        request('/auth/verify-login', {
            method: 'POST',
            body: JSON.stringify({ verificationToken, code }),
        }),

    // БЫЛО: refresh: (refreshToken: string) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    // ПОЧЕМУ ИЗМЕНЕНО: refreshToken больше не передаётся явно — он уже в cookie,
    // бэкенд читает его сам. Функция больше не принимает параметров.
    refresh: () =>
        request('/auth/refresh', { method: 'POST' }),

    // БЫЛО: logout: (refreshToken: string) => request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    logout: () =>
        request('/auth/logout', { method: 'POST' }),

    createProject: (data: {
        workspaceId: string;
        name: string;
        description?: string;
    }) =>
        request<Project>('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getProjectsByWorkspace: (workspaceId: string) =>
        request<Project[]>(`/projects/workspace/${workspaceId}`),

    getProject: (id: string) => request<Project>(`/projects/${id}`),

    createOrganization: (name: string) =>
        request<Organization>('/organizations', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    getMyOrganizations: () =>
        request<Organization[]>('/organizations/my'),

    getOrganization: (id: string) =>
        request<Organization>(`/organizations/${id}`),

    updateOrganization: (id: string, name: string) =>
        request<Organization>(`/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        }),

    deleteOrganization: (id: string) =>
        request<void>(`/organizations/${id}`, {
            method: 'DELETE',
        }),

    saveDashboard: (projectId: string, data: DashboardForm) =>
        request(`/marketing-dashboard/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getDashboard: (projectId: string) =>
        request(`/marketing-dashboard/${projectId}`),

    getDashboardHistory: (projectId: string) =>
        request<DashboardHistoryItem[]>(`/marketing-dashboard/${projectId}/history`),

    createWorkspace: (organizationId: string, name: string) =>
        request<Workspace>('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ organizationId, name }),
        }),

    getMyWorkspaces: () =>
        request<Workspace[]>('/workspaces/my'),

    getWorkspacesByOrganization: (organizationId: string) =>
        request<Workspace[]>(`/workspaces/organization/${organizationId}`),
    getWorkspace: (id: string) => request<Workspace>(`/workspaces/${id}`),
    // БЫЛО:
    // exportDashboard: async (id: string): Promise<Blob> => {
    //     const res = await fetch(`${API_BASE}/marketing-dashboard/${id}/export`, {
    //         headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    //     });
    //     ...
    // }
    // ПОЧЕМУ ИЗМЕНЕНО: этот метод шёл в обход общей функции request() и вручную
    // читал токен из localStorage — теперь тоже переведён на cookie.
    exportDashboard: async (id: string): Promise<Blob> => {
        const res = await fetch(`${API_BASE}/marketing-dashboard/${id}/export`, {
            credentials: 'include', // ДОБАВЛЕНО
        });

        if (!res.ok) {
            throw new Error(`Export failed: ${res.status}`);
        }

        return res.blob();
    },

    exportDashboardHistory: async (projectId: string): Promise<Blob> => {
        const res = await fetch(
            `${API_BASE}/marketing-dashboard/${projectId}/export-history`,
            {
                credentials: 'include', // ДОБАВЛЕНО (было: Authorization заголовок из localStorage)
            },
        );

        if (!res.ok) {
            throw new Error(`Export failed: ${res.status}`);
        }

        return res.blob();
    },

    createArtifact: (projectId: string, data: {
        type: ArtifactType;
        name: string;
        url?: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }) =>
        request<Artifact>(`/artifacts/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getArtifacts: (projectId: string, type?: ArtifactType) =>
        request<Artifact[]>(
            `/artifacts/project/${projectId}${type ? `?type=${type}` : ''}`,
        ),

    getArtifact: (id: string) => request<Artifact>(`/artifacts/${id}`),

    updateArtifact: (id: string, data: Partial<Artifact>) =>
        request<Artifact>(`/artifacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteArtifact: (id: string) =>
        request<void>(`/artifacts/${id}`, { method: 'DELETE' }),

    createSource: (projectId: string, data: { name: string; label: string; icon?: string }) =>
        request<UtmSource>(`/utm/sources/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getSources: (projectId: string) =>
        request<UtmSource[]>(`/utm/sources/project/${projectId}`),

    deleteSource: (id: string) =>
        request<void>(`/utm/sources/${id}`, { method: 'DELETE' }),

    createMedium: (projectId: string, data: { name: string; label: string }) =>
        request<UtmMedium>(`/utm/mediums/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMediums: (projectId: string) =>
        request<UtmMedium[]>(`/utm/mediums/project/${projectId}`),

    deleteMedium: (id: string) =>
        request<void>(`/utm/mediums/${id}`, { method: 'DELETE' }),

    createCampaign: (projectId: string, data: { name: string; label: string; startDate?: string; endDate?: string }) =>
        request<UtmCampaign>(`/utm/campaigns/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getCampaigns: (projectId: string) =>
        request<UtmCampaign[]>(`/utm/campaigns/project/${projectId}`),

    deleteCampaign: (id: string) =>
        request<void>(`/utm/campaigns/${id}`, { method: 'DELETE' }),

    createRule: (projectId: string, data: {
        name: string;
        description?: string;
        priority?: number;
        conditions?: UtmRuleCondition[];
        sourceTemplate: string;
        mediumTemplate: string;
        campaignTemplate?: string;
        contentTemplate?: string;
        termTemplate?: string;
    }) =>
        request<UtmRule>(`/utm/rules/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getRules: (projectId: string) =>
        request<UtmRule[]>(`/utm/rules/project/${projectId}`),

    deleteRule: (id: string) =>
        request<void>(`/utm/rules/${id}`, { method: 'DELETE' }),

    createLink: (projectId: string, data: {
        artifactId?: string;
        campaignId?: string;
        source: string;
        medium: string;
        campaign?: string;
        content?: string;
        term?: string;
        baseUrl: string;
        label?: string;
        notes?: string;
    }) =>
        request<UtmLink>(`/utm/links/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    generateLinks: (projectId: string, data: {
        artifactId: string;
        campaignId?: string;
        baseUrl: string;
        count: number;
        contentPrefix?: string;
    }) =>
        request<UtmLink[]>(`/utm/links/project/${projectId}/generate`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getLinks: (projectId: string, filters?: { campaignId?: string; artifactId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.campaignId) params.set('campaignId', filters.campaignId);
        if (filters?.artifactId) params.set('artifactId', filters.artifactId);
        const qs = params.toString();
        return request<UtmLink[]>(`/utm/links/project/${projectId}${qs ? `?${qs}` : ''}`);
    },

    deleteLink: (id: string) =>
        request<void>(`/utm/links/${id}`, { method: 'DELETE' }),

    createEntity: (
        projectId: string,
        data: {
            moduleId?: string;
            name: string;
            label: string;
            icon?: string;
            color?: string;
        },
    ) =>
        request<Entity>(`/entities/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getEntities: (projectId: string) =>
        request<Entity[]>(`/entities/project/${projectId}`),

    getEntity: (id: string) => request<Entity>(`/entities/${id}`),

    updateEntity: (id: string, data: { label?: string; icon?: string; color?: string }) =>
        request<Entity>(`/entities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteEntity: (id: string) =>
        request<void>(`/entities/${id}`, { method: 'DELETE' }),

    createField: (
        entityId: string,
        data: {
            name: string;
            label: string;
            type: FieldType;
            options?: Record<string, unknown>;
            isRequired?: boolean;
            defaultValue?: unknown;
        },
    ) =>
        request<Field>(`/fields/entity/${entityId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getFields: (entityId: string) =>
        request<Field[]>(`/fields/entity/${entityId}`),

    getFieldTypes: (entityId: string) =>
        request<FieldTypeInfo[]>(`/fields/entity/${entityId}/types`),

    updateField: (id: string, data: Partial<Field>) =>
        request<Field>(`/fields/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteField: (id: string) =>
        request<void>(`/fields/${id}`, { method: 'DELETE' }),

    createRecord: (entityId: string, data: Record<string, unknown>, sprintId?: string | null) =>
        request<EntityRecord>(`/records/entity/${entityId}`, {
            method: 'POST',
            body: JSON.stringify({
                data,
                ...(sprintId !== undefined ? { sprintId } : {}),
            }),
        }),

    getRecords: (entityId: string, query?: ListRecordsQuery) => {
        const params = new URLSearchParams();
        if (query?.page) params.set('page', String(query.page));
        if (query?.limit) params.set('limit', String(query.limit));
        if (query?.sortBy) params.set('sortBy', query.sortBy);
        if (query?.sortDir) params.set('sortDir', query.sortDir);
        if (query?.filterField) params.set('filterField', query.filterField);
        if (query?.filterValue !== undefined)
            params.set('filterValue', query.filterValue);
        if (query?.sprintId !== undefined) params.set('sprintId', query.sprintId);
        const qs = params.toString();
        return request<RecordsResponse>(
            `/records/entity/${entityId}${qs ? `?${qs}` : ''}`,
        );
    },

    getRecord: (id: string) => request<EntityRecord>(`/records/${id}`),

    updateRecord: (id: string, data: Record<string, unknown>, sprintId?: string | null) =>
        request<EntityRecord>(`/records/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data,
                ...(sprintId !== undefined ? { sprintId } : {}),
            }),
        }),

    deleteRecord: (id: string) =>
        request<void>(`/records/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════

    createView: (data: {
        entityId: string;
        name: string;
        type: ViewType;
        config?: Record<string, unknown>;
        isDefault?: boolean;
    }) =>
        request<View>('/views', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getViewsByEntity: (entityId: string) =>
        request<View[]>(`/views/entity/${entityId}`),

    getView: (id: string) => request<View>(`/views/${id}`),

    updateView: (id: string, data: Partial<View>) =>
        request<View>(`/views/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteView: (id: string) =>
        request<void>(`/views/${id}`, { method: 'DELETE' }),



    getEntityTemplates: () =>
        request<EntityTemplate[]>('/entities/templates'),

    createEntityFromTemplate: (projectId: string, templateKey: string) =>
        request<Entity>(`/entities/project/${projectId}/from-template`, {
            method: 'POST',
            body: JSON.stringify({ templateKey }),
        }),



    createSprint: (projectId: string, data: {
        name: string;
        goal?: string;
        description?: string;
        startDate: string;
        endDate: string;
        epicId?: string;
    }) =>
        request<Sprint>(`/sprints/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateSprint: (id: string, data: Partial<{
        name: string;
        goal: string;
        description: string;
        startDate: string;
        endDate: string;
        status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
        epicId: string | null;
    }>) =>
        request<Sprint>(`/sprints/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    getSprints: (projectId: string) =>
        request<Sprint[]>(`/sprints/project/${projectId}`),

    getSprint: (id: string) => request<Sprint>(`/sprints/${id}`),

    getSprintRecords: (id: string) =>
        request<EntityRecord[]>(`/sprints/${id}/records`),


    createMetric: (sprintId: string, data: {
        key: string;
        label: string;
        metricType: 'INCREASE' | 'DECREASE' | 'TARGET';
        targetValue: number;
        actualValue?: number;
        unit?: string;
        xpReward?: number;
    }) =>
        request<SprintMetric>(`/sprints/${sprintId}/metrics`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteMetric: (sprintId: string, id: string) =>
        request<void>(`/sprints/${sprintId}/metrics/${id}`, { method: 'DELETE' }),

    createIncrement: (sprintId: string, data: {
        name: string;
        description?: string;
        icon?: string;
        xp?: number;
    }) =>
        request<Increment>(`/increments/sprint/${sprintId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteIncrement: (id: string) =>
        request<void>(`/increments/${id}`, { method: 'DELETE' }),

    createSprintEvent: (sprintId: string, data: {
        type: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE' | 'PIVOT' | 'PAUSE' | 'BREAKTHROUGH';
        title: string;
        body?: string;
        xp?: number;
    }) =>
        request<SprintEvent>(`/sprints/${sprintId}/events`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteSprintEvent: (sprintId: string, id: string) =>
        request<void>(`/sprints/${sprintId}/events/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // EPICS
    // ═══════════════════════════════════════════════════════════════

    createEpic: (projectId: string, data: {
        name: string;
        description?: string;
        color?: string;
        startDate?: string;
        endDate?: string;
    }) =>
        request<Epic>(`/epics/project/${projectId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getEpics: (projectId: string) =>
        request<Epic[]>(`/epics/project/${projectId}`),

    updateEpic: (id: string, data: Partial<{
        name: string;
        description: string;
        color: string;
        status: EpicStatus;
        startDate: string;
        endDate: string;
    }>) =>
        request<Epic>(`/epics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteEpic: (id: string) =>
        request<void>(`/epics/${id}`, { method: 'DELETE' }),
    // ═══════════════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════════════

    getMe: () => request<User>('/users/me'),

    updateMe: (data: { name?: string; avatarUrl?: string }) =>
        request<User>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    searchUsers: (query: string, limit?: number) => {
        const params = new URLSearchParams({ q: query });
        if (limit) params.set('limit', String(limit));
        return request<User[]>(`/users/search?${params.toString()}`);
    },

    getUser: (id: string) => request<User>(`/users/${id}`),


    // ═══════════════════════════════════════════════════════════════
    // CATEGORIES
    // ═══════════════════════════════════════════════════════════════

    createCategory: (data: {
        organizationId: string;
        parentId?: string;
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        color?: string;
        scope: CategoryScope;
    }) =>
        request<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getCategories: (organizationId: string, scope?: CategoryScope) => {
        const qs = scope ? `?scope=${scope}` : '';
        return request<Category[]>(
            `/categories/organization/${organizationId}${qs}`,
        );
    },

    getCategory: (id: string) => request<Category>(`/categories/${id}`),

    updateCategory: (id: string, data: Partial<Category>) =>
        request<Category>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteCategory: (id: string) =>
        request<void>(`/categories/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // TAGS
    // ═══════════════════════════════════════════════════════════════

    createTag: (data: {
        organizationId: string;
        name: string;
        label: string;
        description?: string;
        icon?: string;
        color?: string;
        categoryId?: string;
        skillId?: string;
    }) =>
        request<Tag>('/tags', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getTags: (organizationId: string) =>
        request<Tag[]>(`/tags/organization/${organizationId}`),

    searchTags: (organizationId: string, query: string) =>
        request<Tag[]>(
            `/tags/organization/${organizationId}/search?q=${encodeURIComponent(query)}`,
        ),

    getTag: (id: string) => request<Tag>(`/tags/${id}`),

    updateTag: (id: string, data: Partial<Tag>) =>
        request<Tag>(`/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteTag: (id: string) =>
        request<void>(`/tags/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // SKILLS
    // ═══════════════════════════════════════════════════════════════

    createSkill: (data: {
        organizationId: string;
        name: string;
        label: string;
        description?: string;
        type: SkillType;
        categoryId?: string;
    }) =>
        request<Skill>('/skills', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getSkills: (organizationId: string) =>
        request<Skill[]>(`/skills/organization/${organizationId}`),

    getSkill: (id: string) => request<Skill>(`/skills/${id}`),

    updateSkill: (id: string, data: Partial<Skill>) =>
        request<Skill>(`/skills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteSkill: (id: string) =>
        request<void>(`/skills/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // USER SKILLS
    // ═══════════════════════════════════════════════════════════════

    getUserSkills: (userId: string) =>
        request<UserSkill[]>(`/user-skills/user/${userId}`),
    getUserSkill: (id: string) =>
        request<UserSkill>(`/user-skills/${id}`),
    addSkillEvidence: (userSkillId: string, data: {
        type: EvidenceType;
        weight?: number;
        comment?: string;
        sourceId?: string;
        sourceType?: string;
    }) =>
        request<unknown>(`/user-skills/${userSkillId}/evidence`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    setSkillLevel: (userSkillId: string, data: {
        level: number;
        comment?: string;
    }) =>
        request<UserSkill>(`/user-skills/${userSkillId}/level`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteUserSkill: (id: string) =>
        request<void>(`/user-skills/${id}`, { method: 'DELETE' }),

    // ═══════════════════════════════════════════════════════════════
    // PROJECT MEMBERS
    // ═══════════════════════════════════════════════════════════════

    getProjectMembers: (projectId: string) =>
        request<ProjectMember[]>(`/projects/${projectId}/members`),

    addProjectMember: (projectId: string, data: {
        userId: string;
        role?: string;
    }) =>
        request<ProjectMember>(`/projects/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateProjectMemberRole: (projectId: string, memberId: string, role: string) =>
        request<ProjectMember>(`/projects/${projectId}/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }),

    removeProjectMember: (projectId: string, memberId: string) =>
        request<void>(`/projects/${projectId}/members/${memberId}`, {
            method: 'DELETE',
        }),

    // ═══════════════════════════════════════════════════════════════
    // INVITATIONS
    // ═══════════════════════════════════════════════════════════════

    createInvitation: (projectId: string, data: {
        email: string;
        role?: string;
    }) =>
        request<Invitation>(`/projects/${projectId}/invitations`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getProjectInvitations: (projectId: string) =>
        request<Invitation[]>(`/projects/${projectId}/invitations`),

    getInvitationByToken: (token: string) =>
        request<Invitation>(`/invitations/${token}`),

    acceptInvitation: (token: string) =>
        request<{ success: boolean; projectId: string; projectName: string }>(
            `/invitations/${token}/accept`,
            { method: 'POST' },
        ),

    deleteInvitation: (id: string) =>
        request<void>(`/invitations/${id}`, { method: 'DELETE' }),



};