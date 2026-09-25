//frontend\src\features\entities\ViewsManager.tsx
import { useEffect, useState } from 'react';
import { Columns, Table2, Calendar, List, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Field, View, ViewType } from '../../types/api';
import ViewForm from './ViewForm';
import KanbanView from './KanbanView';

interface ViewsManagerProps {
    entityId: string;
    fields: Field[];
    sprintFilter?: string | null;
}

const TYPE_ICONS: Record<ViewType, LucideIcon> = {
    KANBAN: Columns,
    TABLE: Table2,
    CALENDAR: Calendar,
    LIST: List,
};

const TYPE_LABELS: Record<ViewType, string> = {
    KANBAN: 'Канбан',
    TABLE: 'Таблица',
    CALENDAR: 'Календарь',
    LIST: 'Список',
};

export default function ViewsManager({ entityId, fields, sprintFilter }: ViewsManagerProps) {
    const [views, setViews] = useState<View[]>([]);
    const [activeView, setActiveView] = useState<View | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadViews = async () => {
        try {
            const data = await api.getViewsByEntity(entityId);
            setViews(data);
            if (data.length > 0 && !activeView) {
                setActiveView(data[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load views');
        }
    };

    useEffect(() => {
        loadViews();
    }, [entityId]);

    const handleCreate = async (data: {
        name: string;
        type: ViewType;
        config?: Record<string, unknown>;
    }) => {
        setLoading(true);
        setError('');

        try {
            const view = await api.createView({
                entityId,
                ...data,
            });
            await loadViews();
            setActiveView(view as View);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create view');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить представление?')) return;

        try {
            await api.deleteView(id);
            if (activeView?.id === id) {
                setActiveView(null);
            }
            await loadViews();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    return (
        <div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 24 }}>
                {/* Левая панель — форма + список */}
                <div>
                    <ViewForm fields={fields} onSubmit={handleCreate} loading={loading} />

                    {views.length > 0 && (
                        <div
                            style={{
                                marginTop: 16,
                                background: 'var(--bg-surface)',
                                padding: 16,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 12,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Мои представления ({views.length})
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {views.map((v) => {
                                    const Icon = TYPE_ICONS[v.type];
                                    const isActive = activeView?.id === v.id;

                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => setActiveView(v)}
                                            style={{
                                                padding: '10px 12px',
                                                background: isActive
                                                    ? 'rgba(168, 85, 247, 0.15)'
                                                    : 'var(--bg-elevated)',
                                                border: '1px solid',
                                                borderColor: isActive
                                                    ? 'var(--accent)'
                                                    : 'var(--border)',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <Icon
                                                size={14}
                                                style={{
                                                    color: isActive
                                                        ? 'var(--accent-bright)'
                                                        : 'var(--text-muted)',
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        color: isActive
                                                            ? 'var(--text-primary)'
                                                            : 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {v.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--text-dim)',
                                                    }}
                                                >
                                                    {TYPE_LABELS[v.type]}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(v.id);
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-dim)',
                                                    cursor: 'pointer',
                                                    padding: 2,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = 'var(--error)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-dim)';
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Правая панель — активное представление */}
                <div>
                    {!activeView ? (
                        <div
                            style={{
                                background: 'var(--bg-surface)',
                                padding: 40,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Выбери или создай представление слева
                        </div>
                    ) : activeView.type === 'KANBAN' ? (
                        <KanbanView
                            entityId={entityId}
                            fields={fields}
                            config={activeView.config}
                            sprintId={sprintFilter}
                        />
                    ) : (
                        <div
                            style={{
                                background: 'var(--bg-surface)',
                                padding: 40,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Тип «{TYPE_LABELS[activeView.type]}» в разработке
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}