//frontend\src\pages\ProjectsPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Organization, Workspace } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface ProjectsPageProps {
    onOpenWorkspace: (workspaceId: string, workspaceName: string) => void;
}

export default function ProjectsPage({ onOpenWorkspace }: ProjectsPageProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
    const [newOrgName, setNewOrgName] = useState('');
    const [newWsName, setNewWsName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadOrganizations = async () => {
        try {
            const data = await api.getMyOrganizations();
            setOrganizations(data);

            if (data.length > 0 && !selectedOrg) {
                setSelectedOrg(data[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        }
    };

    const loadWorkspaces = async (orgId: string) => {
        try {
            const data = await api.getWorkspacesByOrganization(orgId);
            setWorkspaces(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        }
    };

    useEffect(() => {
        loadOrganizations();
    }, []);

    useEffect(() => {
        if (selectedOrg) {
            loadWorkspaces(selectedOrg);
        }
    }, [selectedOrg]);

    const handleCreateOrganization = async () => {
        if (!newOrgName.trim()) return;
        setLoading(true);
        setError('');

        try {
            await api.createOrganization(newOrgName);
            setNewOrgName('');
            await loadOrganizations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async () => {
        if (!newWsName.trim() || !selectedOrg) return;
        setLoading(true);
        setError('');

        try {
            await api.createWorkspace(selectedOrg, newWsName);
            setNewWsName('');
            await loadWorkspaces(selectedOrg);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
                📁 Проекты
            </h1>

            {error && (
                <div style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Организации */}
                <div
                    style={{
                        background: '#fff',
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                        🏢 Организации
                    </h2>

                    <Input
                        label="Новая организация"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Название"
                    />

                    <Button onClick={handleCreateOrganization} loading={loading}>
                        Создать организацию
                    </Button>

                    <div style={{ marginTop: 20 }}>
                        {organizations.length === 0 ? (
                            <p style={{ color: '#718096' }}>Пока нет организаций</p>
                        ) : (
                            organizations.map((org) => (
                                <div
                                    key={org.id}
                                    onClick={() => setSelectedOrg(org.id)}
                                    style={{
                                        padding: 12,
                                        marginBottom: 8,
                                        borderRadius: 8,
                                        background: selectedOrg === org.id ? '#eef2ff' : '#f7fafc',
                                        cursor: 'pointer',
                                        border:
                                            selectedOrg === org.id
                                                ? '1px solid #6366f1'
                                                : '1px solid transparent',
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{org.name}</div>
                                    <div style={{ fontSize: 12, color: '#718096' }}>
                                        Роль: {org.role} · Workspace: {org._count?.workspaces ?? 0}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Workspaces */}
                <div
                    style={{
                        background: '#fff',
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                        🗂 Workspaces
                    </h2>

                    {!selectedOrg ? (
                        <p style={{ color: '#718096' }}>Выбери организацию слева</p>
                    ) : (
                        <>
                            <Input
                                label="Новый workspace"
                                value={newWsName}
                                onChange={(e) => setNewWsName(e.target.value)}
                                placeholder="Название"
                            />

                            <Button onClick={handleCreateWorkspace} loading={loading}>
                                Создать workspace
                            </Button>

                            <div style={{ marginTop: 20 }}>
                                {workspaces.length === 0 ? (
                                    <p style={{ color: '#718096' }}>Пока нет workspace</p>
                                ) : (
                                    workspaces.map((ws) => (
                                        <div
                                            key={ws.id}
                                            onClick={() => onOpenWorkspace(ws.id, ws.name)}
                                            style={{
                                                padding: 12,
                                                marginBottom: 8,
                                                borderRadius: 8,
                                                background: '#f7fafc',
                                                cursor: 'pointer',
                                                border: '1px solid transparent',
                                                transition: 'border 0.15s',
                                            }}
                                            onMouseEnter={(e) =>
                                            (e.currentTarget.style.border =
                                                '1px solid #6366f1')
                                            }
                                            onMouseLeave={(e) =>
                                            (e.currentTarget.style.border =
                                                '1px solid transparent')
                                            }
                                        >
                                            <div style={{ fontWeight: 600 }}>{ws.name}</div>
                                            <div style={{ fontSize: 12, color: '#718096' }}>
                                                Проектов: {ws._count?.projects ?? 0} · Участников:{' '}
                                                {ws._count?.members ?? 0}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}