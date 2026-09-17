//frontend/src/pages/dashboard/entities/EntityDetailPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Table2, ListChecks, Database } from 'lucide-react';
import { api } from '../../../api/client';
import { Entity, Field } from '../../../types/api';
import FieldsManager from './FieldsManager';
import RecordsTable from './RecordsTable';
import { Columns } from 'lucide-react';
import ViewsManager from './ViewsManager';
interface EntityDetailPageProps {
    entityId: string;
    entityLabel: string;
    onBack: () => void;
}


type Tab = 'fields' | 'records' | 'views';
export default function EntityDetailPage({
    entityId,
    entityLabel,
    onBack,
}: EntityDetailPageProps) {
    const [entity, setEntity] = useState<Entity | null>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [tab, setTab] = useState<Tab>('fields');
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .getEntity(entityId)
            .then((e) => {
                setEntity(e);
                if (e.fields) setFields(e.fields);
            })
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load entity'),
            );
    }, [entityId]);

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
                Назад к сущностям
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
                {entity?.label ?? entityLabel}
                {entity && (
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            background: 'var(--bg-hover)',
                            padding: '4px 10px',
                            borderRadius: 8,
                        }}
                    >
                        {entity.name}
                    </span>
                )}
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

            {/* Табы */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 24,
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <TabButton
                    active={tab === 'fields'}
                    onClick={() => setTab('fields')}
                    icon={<ListChecks size={16} />}
                >
                    Поля ({fields.length})
                </TabButton>
                <TabButton
                    active={tab === 'records'}
                    onClick={() => setTab('records')}
                    icon={<Table2 size={16} />}
                >
                    Записи
                </TabButton>
                <TabButton
                    active={tab === 'views'}
                    onClick={() => setTab('views')}
                    icon={<Columns size={16} />}
                >
                    Представления
                </TabButton>
            </div>

            {/* Контент */}
            {tab === 'fields' && (
                <FieldsManager entityId={entityId} onFieldsChange={setFields} />
            )}

            {tab === 'records' && (
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
                    <RecordsTable entityId={entityId} fields={fields} />
                </div>
            )}
            {tab === 'views' && <ViewsManager entityId={entityId} fields={fields} />}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
            }}
        >
            {icon}
            {children}
        </button>
    );
}