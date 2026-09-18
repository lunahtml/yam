//frontend/src/pages/MainPage.tsx
import { useEffect, useState } from 'react';
import {
    Plus,
    FolderKanban,
    Building2,
    Sparkles,
    LogOut,
    Layers,
    Briefcase,
} from 'lucide-react';
import { api } from '../api/client';
import { Organization, Workspace, Project } from '../types/api';
import Input from '../components/Input';
import Button from '../components/Button';
import './MainPage.css';

interface MainPageProps {
    onOpenProject: (projectId: string, projectName: string) => void;
    onLogout: () => void;
}

interface WorkspaceWithProjects extends Workspace {
    projectsData: Project[];
}

interface OrgWithWorkspaces extends Organization {
    workspacesData: WorkspaceWithProjects[];
}

type ModalType =
    | { type: 'none' }
    | { type: 'organization' }
    | { type: 'workspace'; organizationId: string }
    | { type: 'project'; workspaceId: string };

export default function MainPage({ onOpenProject, onLogout }: MainPageProps) {
    const [organizations, setOrganizations] = useState<OrgWithWorkspaces[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState<ModalType>({ type: 'none' });
    const [inputValue, setInputValue] = useState('');
    const [inputDesc, setInputDesc] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        setError('');

        try {
            const orgs = await api.getMyOrganizations();
            const orgsWithData: OrgWithWorkspaces[] = [];

            for (const org of orgs) {
                const workspaces = await api.getWorkspacesByOrganization(org.id);
                const wsWithProjects: WorkspaceWithProjects[] = [];

                for (const ws of workspaces) {
                    const projects = await api.getProjectsByWorkspace(ws.id);
                    wsWithProjects.push({ ...ws, projectsData: projects });
                }

                orgsWithData.push({ ...org, workspacesData: wsWithProjects });
            }

            setOrganizations(orgsWithData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!inputValue.trim()) return;
        setSaving(true);
        setError('');

        try {
            if (modal.type === 'organization') {
                await api.createOrganization(inputValue.trim());
            } else if (modal.type === 'workspace') {
                await api.createWorkspace(modal.organizationId, inputValue.trim());
            } else if (modal.type === 'project') {
                await api.createProject({
                    workspaceId: modal.workspaceId,
                    name: inputValue.trim(),
                    description: inputDesc.trim() || undefined,
                });
            }

            setModal({ type: 'none' });
            setInputValue('');
            setInputDesc('');
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-page">
            <div className="main-header">
                <div className="main-header-logo">
                    <div className="main-header-logo-icon">
                        <Sparkles size={24} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="main-header-title">YAM</div>
                        <div className="main-header-subtitle">You Are Magic</div>
                    </div>
                </div>

                <button className="main-logout" onClick={onLogout}>
                    <LogOut size={16} />
                    Выйти
                </button>
            </div>

            <div className="main-content">
                <div className="main-title-row">
                    <h1 className="main-title">Мои проекты</h1>
                    <Button
                        onClick={() => {
                            setModal({ type: 'organization' });
                            setInputValue('');
                        }}
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        <Plus size={16} />
                        Создать организацию
                    </Button>
                </div>

                {error && <div className="main-error">{error}</div>}

                {loading ? (
                    <div className="main-loading">Загрузка...</div>
                ) : organizations.length === 0 ? (
                    <div className="main-empty">
                        <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <p>У вас пока нет организаций.</p>
                        <p className="main-empty-hint">
                            Создайте организацию, чтобы начать.
                        </p>
                    </div>
                ) : (
                    <div className="main-orgs">
                        {organizations.map((org) => (
                            <div key={org.id} className="main-org">
                                <div className="main-org-header">
                                    <Building2 size={18} />
                                    <span className="main-org-name">{org.name}</span>
                                    <span className="main-org-role">{org.role}</span>
                                    <button
                                        className="main-org-add-ws"
                                        onClick={() => {
                                            setModal({ type: 'workspace', organizationId: org.id });
                                            setInputValue('');
                                        }}
                                        title="Создать workspace"
                                    >
                                        <Plus size={14} />
                                        Workspace
                                    </button>
                                </div>

                                <div className="main-workspaces">
                                    {org.workspacesData.map((ws) => (
                                        <div key={ws.id} className="main-workspace">
                                            <div className="main-workspace-header">
                                                <Layers size={14} />
                                                <span className="main-workspace-name">{ws.name}</span>
                                                <button
                                                    className="main-workspace-add-project"
                                                    onClick={() => {
                                                        setModal({ type: 'project', workspaceId: ws.id });
                                                        setInputValue('');
                                                        setInputDesc('');
                                                    }}
                                                    title="Создать проект"
                                                >
                                                    <Plus size={12} />
                                                    Проект
                                                </button>
                                            </div>

                                            {ws.projectsData.length === 0 ? (
                                                <div className="main-projects-empty">
                                                    Нет проектов
                                                </div>
                                            ) : (
                                                <div className="main-projects">
                                                    {ws.projectsData.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            className="main-project"
                                                            onClick={() => onOpenProject(p.id, p.name)}
                                                        >
                                                            <Briefcase
                                                                size={14}
                                                                className="main-project-icon"
                                                            />
                                                            <div className="main-project-name">{p.name}</div>
                                                            {p.description && (
                                                                <div className="main-project-desc">
                                                                    {p.description}
                                                                </div>
                                                            )}
                                                            <div className="main-project-status">
                                                                {p.status}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Модалка */}
            {modal.type !== 'none' && (
                <div
                    className="main-modal-overlay"
                    onClick={() => setModal({ type: 'none' })}
                >
                    <div className="main-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="main-modal-title">
                            {modal.type === 'organization' && 'Новая организация'}
                            {modal.type === 'workspace' && 'Новый workspace'}
                            {modal.type === 'project' && 'Новый проект'}
                        </h3>

                        <Input
                            label="Название"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={
                                modal.type === 'organization'
                                    ? 'Моя компания'
                                    : modal.type === 'workspace'
                                        ? 'Digital'
                                        : 'Интернет-магазин'
                            }
                            autoFocus
                        />

                        {modal.type === 'project' && (
                            <Input
                                label="Описание (необязательно)"
                                value={inputDesc}
                                onChange={(e) => setInputDesc(e.target.value)}
                                placeholder="Краткое описание"
                            />
                        )}

                        <div className="main-modal-actions">
                            <Button onClick={handleCreate} loading={saving}>
                                <Plus size={16} />
                                Создать
                            </Button>
                            <Button
                                onClick={() => setModal({ type: 'none' })}
                                variant="secondary"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}