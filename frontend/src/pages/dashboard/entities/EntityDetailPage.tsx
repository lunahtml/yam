//frontend/src/pages/dashboard/entities/EntityDetailPage.tsx
import { useEffect, useState } from 'react';
import { Database, ListChecks, Table2, Columns, ArrowLeft } from 'lucide-react';
import { api } from '../../../api/client';
import { Entity, Field } from '../../../types/api';
import FieldsManager from './FieldsManager';
import RecordsTable from './RecordsTable';
import ViewsManager from './ViewsManager';
import './EntityDetailPage.css';

interface EntityDetailPageProps {
    entityId: string;
    entityLabel: string;
    onBack?: () => void;
}

type Tab = 'records' | 'views' | 'fields';

export default function EntityDetailPage({
    entityId,
    entityLabel,
    onBack,
}: EntityDetailPageProps) {
    const [entity, setEntity] = useState<Entity | null>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [tab, setTab] = useState<Tab>('records');
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
        <div className="entity-detail">
            {onBack && (
                <button className="entity-detail-back" onClick={onBack}>
                    <ArrowLeft size={16} />
                    Назад
                </button>
            )}

            <h1 className="entity-detail-title">
                <span className="entity-detail-title-icon">
                    <Database size={22} color="#fff" strokeWidth={2.5} />
                </span>
                {entity?.label ?? entityLabel}
                {entity && (
                    <span className="entity-detail-name">{entity.name}</span>
                )}
            </h1>

            {error && <div className="entity-detail-error">{error}</div>}

            <div className="entity-detail-tabs">
                <button
                    className={`entity-detail-tab ${tab === 'records' ? 'entity-detail-tab-active' : ''}`}
                    onClick={() => setTab('records')}
                >
                    <Table2 size={16} />
                    Записи
                </button>
                <button
                    className={`entity-detail-tab ${tab === 'views' ? 'entity-detail-tab-active' : ''}`}
                    onClick={() => setTab('views')}
                >
                    <Columns size={16} />
                    Представления
                </button>
                <button
                    className={`entity-detail-tab ${tab === 'fields' ? 'entity-detail-tab-active' : ''}`}
                    onClick={() => setTab('fields')}
                >
                    <ListChecks size={16} />
                    Поля ({fields.length})
                </button>
            </div>

            <div className="entity-detail-content">
                {tab === 'fields' && (
                    <FieldsManager entityId={entityId} onFieldsChange={setFields} />
                )}

                {tab === 'records' && (
                    <RecordsTable entityId={entityId} fields={fields} />
                )}

                {tab === 'views' && (
                    <ViewsManager entityId={entityId} fields={fields} />
                )}
            </div>
        </div>
    );
}