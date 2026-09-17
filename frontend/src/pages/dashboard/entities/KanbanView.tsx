//frontend/src/pages/dashboard/entities/KanbanView.tsx
import { useEffect, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { api } from '../../../api/client';
import { EntityRecord, Field } from '../../../types/api';
import './KanbanView.css';

interface KanbanViewProps {
    entityId: string;
    fields: Field[];
    config: Record<string, unknown>;
}

interface KanbanColumn {
    key: string;
    label: string;
}

export default function KanbanView({
    entityId,
    fields,
    config,
}: KanbanViewProps) {
    const [records, setRecords] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);

    const groupField = config.groupBy as string | undefined;
    const groupFieldDef = groupField
        ? fields.find((f) => f.name === groupField)
        : undefined;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );

    const loadRecords = async () => {
        setLoading(true);
        try {
            const res = await api.getRecords(entityId, { page: 1, limit: 500 });
            setRecords(res.records);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [entityId]);

    const columns: KanbanColumn[] = (() => {
        if (!groupFieldDef) return [{ key: 'all', label: 'Все записи' }];

        if (
            groupFieldDef.type === 'select' &&
            groupFieldDef.options &&
            typeof groupFieldDef.options === 'object' &&
            'choices' in groupFieldDef.options
        ) {
            const choices = (groupFieldDef.options as { choices: string[] }).choices;
            return choices.map((c) => ({ key: c, label: c }));
        }

        if (groupFieldDef.type === 'boolean') {
            return [
                { key: 'true', label: 'Да' },
                { key: 'false', label: 'Нет' },
            ];
        }

        return [{ key: 'all', label: 'Все записи' }];
    })();

    const getRecordColumn = (record: EntityRecord): string => {
        if (!groupFieldDef) return 'all';
        const value = record.data[groupFieldDef.name];
        if (value === null || value === undefined) return '';
        return String(value);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || !groupFieldDef) return;

        const recordId = String(active.id);
        const newColumn = String(over.id);

        const record = records.find((r) => r.id === recordId);
        if (!record) return;

        const oldColumn = getRecordColumn(record);
        if (oldColumn === newColumn) return;

        // Обновляем локально
        setRecords((prev) =>
            prev.map((r) =>
                r.id === recordId
                    ? { ...r, data: { ...r.data, [groupFieldDef.name]: newColumn } }
                    : r,
            ),
        );

        // Отправляем на сервер
        try {
            await api.updateRecord(recordId, {
                ...record.data,
                [groupFieldDef.name]: newColumn,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
            // Откатываем
            await loadRecords();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить запись?')) return;
        try {
            await api.deleteRecord(id);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const formatCardValue = (record: EntityRecord, field: Field): string => {
        const value = record.data[field.name];
        if (value === null || value === undefined) return '—';
        if (field.type === 'boolean') return value ? 'Да' : 'Нет';
        if (field.type === 'date') {
            try {
                return new Date(String(value)).toLocaleDateString('ru-RU');
            } catch {
                return String(value);
            }
        }
        return String(value).slice(0, 100);
    };

    const cardFields = fields
        .filter((f) => f.name !== groupField)
        .slice(0, 3);

    if (loading) {
        return <div className="kanban-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="kanban-error">{error}</div>;
    }

    if (!groupFieldDef) {
        return (
            <div className="kanban-empty">
                <p>Для канбана нужно указать поле для группировки.</p>
                <p>Создай поле типа «Список» (например, «Статус») и настрой view.</p>
            </div>
        );
    }

    const activeRecord = activeId
        ? records.find((r) => r.id === activeId)
        : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.key}
                        column={col}
                        records={records.filter((r) => getRecordColumn(r) === col.key)}
                        fields={fields}
                        cardFields={cardFields}
                        formatCardValue={formatCardValue}
                        onDelete={handleDelete}
                        activeId={activeId}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeRecord && (
                    <div className="kanban-card kanban-card-dragging">
                        <div className="kanban-card-title">
                            {formatCardValue(
                                activeRecord,
                                fields[0] || ({ name: 'id', label: 'ID', type: 'text' } as Field),
                            )}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({
    column,
    records,
    fields,
    cardFields,
    formatCardValue,
    onDelete,
    activeId,
}: {
    column: KanbanColumn;
    records: EntityRecord[];
    fields: Field[];
    cardFields: Field[];
    formatCardValue: (r: EntityRecord, f: Field) => string;
    onDelete: (id: string) => void;
    activeId: string | null;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: column.key });

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
        >
            <div className="kanban-column-header">
                <div className="kanban-column-title">{column.label}</div>
                <span className="kanban-column-count">{records.length}</span>
            </div>

            <div className="kanban-column-body">
                {records.length === 0 ? (
                    <div className="kanban-column-empty">Пусто</div>
                ) : (
                    records.map((record) => (
                        <KanbanCard
                            key={record.id}
                            record={record}
                            fields={fields}
                            cardFields={cardFields}
                            formatCardValue={formatCardValue}
                            onDelete={onDelete}
                            isDragging={activeId === record.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function KanbanCard({
    record,
    fields,
    cardFields,
    formatCardValue,
    onDelete,
    isDragging,
}: {
    record: EntityRecord;
    fields: Field[];
    cardFields: Field[];
    formatCardValue: (r: EntityRecord, f: Field) => string;
    onDelete: (id: string) => void;
    isDragging: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: record.id,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card ${isDragging ? 'kanban-card-ghost' : ''}`}
            style={style}
            {...listeners}
            {...attributes}
        >
            <div className="kanban-card-header">
                <div className="kanban-card-title">
                    {formatCardValue(
                        record,
                        fields[0] || ({ name: 'id', label: 'ID', type: 'text' } as Field),
                    )}
                </div>
                <button
                    className="kanban-card-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(record.id);
                    }}
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {cardFields.slice(1).map((f) => (
                <div key={f.id} className="kanban-card-field">
                    <span className="kanban-card-field-label">{f.label}:</span>{' '}
                    {formatCardValue(record, f)}
                </div>
            ))}
        </div>
    );
}