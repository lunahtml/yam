//frontend\src\pages\project\ArtifactsPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Link2, Globe, Smartphone, FileText, BarChart3, Video, Folder, Building2, Link as LinkIcon, Trash2, LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Artifact, ArtifactType } from '../../types/api';
import ArtifactForm from '../dashboard/artifacts/ArtifactForm';
interface ArtifactsPageProps {
    projectId: string;
    projectName: string;
    onBack?: () => void;
}

const TYPE_LABELS: Record<
    ArtifactType,
    { label: string; icon: LucideIcon }
> = {
    WEBSITE: { label: 'Сайт', icon: Globe },
    SOCIAL: { label: 'Соцсеть', icon: Smartphone },
    DOCUMENT: { label: 'Документ', icon: FileText },
    DASHBOARD: { label: 'Дашборд', icon: BarChart3 },
    VIDEO: { label: 'Видео', icon: Video },
    FILE: { label: 'Файл', icon: Folder },
    OFFLINE: { label: 'Офлайн', icon: Building2 },
    CUSTOM: { label: 'Другое', icon: LinkIcon },
};

export default function ArtifactsPage({
    projectId,
    projectName,
    onBack,
}: ArtifactsPageProps) {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [filter, setFilter] = useState<ArtifactType | 'ALL'>('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadArtifacts();
    }, [projectId]);

    const loadArtifacts = async () => {
        try {
            const data = await api.getArtifacts(projectId);
            setArtifacts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load artifacts');
        }
    };

    const handleCreate = async (data: {
        type: ArtifactType;
        name: string;
        url?: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }) => {
        setLoading(true);
        setError('');

        try {
            await api.createArtifact(projectId, data);
            await loadArtifacts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить артефакт?')) return;

        try {
            await api.deleteArtifact(id);
            await loadArtifacts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const filtered =
        filter === 'ALL' ? artifacts : artifacts.filter((a) => a.type === filter);

    return (
        <div>
            {onBack && (
                <button
                    onClick={onBack}
                    className="artifacts-back"
                >
                    <ArrowLeft size={16} />
                    Назад к проекту
                </button>
            )}

            <h1
                style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                }}
            >
                <span
                    style={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 24px var(--accent-glow)',
                    }}
                >
                    <Link2 size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Артефакты проекта {projectName}
            </h1>

            {error && (
                <div
                    style={{
                        color: 'var(--error)',
                        marginBottom: 16,
                        fontSize: 13,
                        padding: 12,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                    }}
                >
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <ArtifactForm onSubmit={handleCreate} loading={loading} />

                <div
                    style={{
                        background: 'var(--bg-surface)',
                        padding: 24,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}
                        >
                            Список ({filtered.length})
                        </h3>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as ArtifactType | 'ALL')}
                            style={{
                                padding: '6px 12px',
                                fontSize: 13,
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="ALL">Все типы</option>
                            {Object.entries(TYPE_LABELS).map(([key, { label }]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {filtered.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>
                            Пока нет артефактов. Создай первый слева.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {filtered.map((a) => {
                                const t = TYPE_LABELS[a.type];
                                const Icon = t.icon;
                                return (
                                    <div
                                        key={a.id}
                                        style={{
                                            padding: 14,
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 10,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 12,
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-bright)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <Icon size={16} />
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {a.name}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--text-muted)',
                                                        background: 'var(--bg-hover)',
                                                        padding: '2px 8px',
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    {t.label}
                                                </span>
                                            </div>

                                            {a.url && (
                                                <a
                                                    href={a.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        fontSize: 12,
                                                        color: 'var(--cyan)',
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    {a.url}
                                                </a>
                                            )}

                                            {a.description && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: 'var(--text-muted)',
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    {a.description}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--error)',
                                                cursor: 'pointer',
                                                padding: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderRadius: 6,
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background =
                                                    'rgba(239, 68, 68, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
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