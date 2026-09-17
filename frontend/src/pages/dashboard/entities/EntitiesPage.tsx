//frontend/src/pages/dashboard/entities/EntitiesPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Database, Plus, Table2, Trash2, ListChecks } from 'lucide-react';
import { api } from '../../../api/client';
import { Entity } from '../../../types/api';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

interface EntitiesPageProps {
    projectId: string;
    projectName: string;
    onBack: () => void;
    onOpenEntity: (entityId: string, entityLabel: string) => void;
}

export default function EntitiesPage({
    projectId,
    projectName,
    onBack,
    onOpenEntity,
}: EntitiesPageProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [newName, setNewName] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadEntities = async () => {
        try {
            const data = await api.getEntities(projectId);
            setEntities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load entities');
        }
    };

    useEffect(() => {
        loadEntities();
    }, [projectId]);

    const handleCreate = async () => {
        if (!newName.trim() || !newLabel.trim()) return;
        setLoading(true);
        setError('');

        try {
            await api.createEntity(projectId, {
                name: newName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                label: newLabel.trim(),
            });
            setNewName('');
            setNewLabel('');
            await loadEntities();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить сущность? Все её записи будут потеряны.')) return;

        try {
            await api.deleteEntity(id);
            await loadEntities();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    return (
        <div>
            <button
                onClick={onBack}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--cyan)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                <ArrowLeft size={16} />
                Назад к проекту
            </button>

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
                    <Database size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Сущности проекта {projectName}
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
                {/* Форма создания */}
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        padding: 24,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                        height: 'fit-content',
                    }}
                >
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 16,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <Plus size={18} />
                        Новая сущность
                    </h3>

                    <Input
                        label="Название (латиница, snake_case)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="clients"
                    />

                    <Input
                        label="Отображаемое имя"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Клиенты"
                    />

                    <Button onClick={handleCreate} loading={loading}>
                        <Plus size={16} />
                        Создать сущность
                    </Button>
                </div>

                {/* Список */}
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        padding: 24,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 16,
                            color: 'var(--text-primary)',
                        }}
                    >
                        Список ({entities.length})
                    </h3>

                    {entities.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>
                            Пока нет сущностей. Создай первую слева.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {entities.map((e) => (
                                <div
                                    key={e.id}
                                    style={{
                                        padding: 16,
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'all 0.15s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(ev) => {
                                        ev.currentTarget.style.borderColor = 'var(--border-bright)';
                                    }}
                                    onMouseLeave={(ev) => {
                                        ev.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                    onClick={() => onOpenEntity(e.id, e.label)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Table2 size={16} />
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                }}
                                            >
                                                {e.label}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--text-muted)',
                                                    background: 'var(--bg-hover)',
                                                    padding: '2px 8px',
                                                    borderRadius: 10,
                                                    fontFamily: 'monospace',
                                                }}
                                            >
                                                {e.name}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: 'var(--text-muted)',
                                                display: 'flex',
                                                gap: 12,
                                            }}
                                        >
                                            <span>
                                                <ListChecks size={12} style={{ display: 'inline', marginRight: 4 }} />
                                                Полей: {e._count?.fields ?? 0}
                                            </span>
                                            <span>
                                                <Table2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                                                Записей: {e._count?.records ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            handleDelete(e.id);
                                        }}
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
                                        onMouseEnter={(ev) => {
                                            ev.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                        onMouseLeave={(ev) => {
                                            ev.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}