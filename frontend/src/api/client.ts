//frontend\src\api\client.ts
const API_BASE = '/api';
import { Organization, Workspace, Project } from '../types/api';
async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

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

    refresh: (refreshToken: string) =>
        request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

    logout: (refreshToken: string) =>
        request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

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


    // Organizations
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

    // Workspaces
    createWorkspace: (organizationId: string, name: string) =>
        request<Workspace>('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ organizationId, name }),
        }),

    getMyWorkspaces: () =>
        request<Workspace[]>('/workspaces/my'),

    getWorkspacesByOrganization: (organizationId: string) =>
        request<Workspace[]>(`/workspaces/organization/${organizationId}`),
};