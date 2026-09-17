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
            return retryData;
        }

        // refresh тоже не прошёл — сессия реально кончилась (например, logout
        // на другом устройстве или refresh-токен истёк через 30 дней)
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

    getProject: (id: string) => request(`/projects/${id}`),

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

    createRecord: (entityId: string, data: Record<string, unknown>) =>
        request<EntityRecord>(`/records/entity/${entityId}`, {
            method: 'POST',
            body: JSON.stringify({ data }),
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
        const qs = params.toString();
        return request<RecordsResponse>(
            `/records/entity/${entityId}${qs ? `?${qs}` : ''}`,
        );
    },

    getRecord: (id: string) => request<EntityRecord>(`/records/${id}`),

    updateRecord: (id: string, data: Record<string, unknown>) =>
        request<EntityRecord>(`/records/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ data }),
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
};