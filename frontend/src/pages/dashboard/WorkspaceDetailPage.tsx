//frontend\src\pages\dashboard\WorkspaceDetailPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Project } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface WorkspaceDetailPageProps {
    workspaceId: string;
    workspaceName: string;
    onBack: () => void;
    onOpenProject: (projectId: string, projectName: string) => void;
}

export default function WorkspaceDetailPage({
    workspaceId,
    workspaceName,
    onBack,
    onOpenProject,
}: WorkspaceDetailPageProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadProjects = async () => {
        try {
            const data = await api.getProjectsByWorkspace(workspaceId);
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        }
    };

    useEffect(() => {
        loadProjects();
    }, [workspaceId]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setLoading(true);
        setError('');

        try {
            await api.createProject({
                workspaceId,
                name: newProjectName,
                description: newProjectDescription || undefined,
            });
            setNewProjectName('');
            setNewProjectDescription('');
            await loadProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'ACTIVE':
                return { bg: '#f0fff4', color: '#38a169' };
            case 'ARCHIVED':
                return { bg: '#f7fafc', color: '#718096' };
            case 'COMPLETED':
                return { bg: '#ebf8ff', color: '#3182ce' };
            default:
                return { bg: '#f7fafc', color: '#718096' };
        }
    };

    const getStatusLabel = (status: Project['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'Активен';
            case 'ARCHIVED':
                return 'В архиве';
            case 'COMPLETED':
                return 'Завершён';
            default:
                return status;
        }
    };

    return (
        <div>
            {/* Breadcrumb / Back */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6366f1',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 0,
                        marginBottom: 8,
                    }}
                >
                    ← Назад к workspaces
                </button>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>
                    🗂 {workspaceName}
                </h1>
            </div>

            {error && (
                <div style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                {/* Форма создания */}
                <div
                    style={{
                        background: '#fff',
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        height: 'fit-content',
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                        ➕ Новый проект
                    </h2>

                    <Input
                        label="Название"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Например: Интернет-магазин"
                    />

                    <Input
                        label="Описание (необязательно)"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder="Краткое описание"
                    />

                    <Button onClick={handleCreateProject} loading={loading}>
                        Создать проект
                    </Button>
                </div>

                {/* Список проектов */}
                <div
                    style={{
                        background: '#fff',
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                        📁 Проекты ... ({projects.length})
                    </h2>

                    {projects.length === 0 ? (
                        <p style={{ color: '#718096' }}>
                            Пока нет проектов. Создай первый слева.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {projects.map((project) => {
                                const statusStyle = getStatusColor(project.status);

                                return (
                                    <div
                                        key={project.id}
                                        onClick={() => onOpenProject(project.id, project.name)}
                                        style={{
                                            padding: 16,
                                            borderRadius: 10,
                                            background: '#f7fafc',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#5f6680';
                                            e.currentTarget.style.borderColor = '#6366f1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f7fafc';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: 15, color: '#4a5568' }}>
                                                {project.name}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    padding: '2px 10px',
                                                    borderRadius: 12,
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,

                                                    fontWeight: 500,
                                                }}
                                            >
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </div>

                                        {project.description && (
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#718096',
                                                    marginTop: 4,
                                                }}
                                            >
                                                {project.description}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: '#a0aec0',
                                                marginTop: 8,
                                            }}
                                        >
                                            Создан:{' '}
                                            {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}