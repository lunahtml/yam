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
    useDraggable,
} from '@dnd-kit/core';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../../api/client';
import { EntityRecord, Field } from '../../../types/api';
import TaskDetailPopup from './TaskDetailPopup';
import TaskQuickForm from './TaskQuickForm';
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

const COLUMN_LABELS: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    in_progress: 'В работе',
    review: 'Review',
    done: 'Готово',
    new: 'Новое',
    mql: 'MQL',
    sql: 'SQL',
    meeting: 'Встреча',
    deal: 'Сделка',
    lost: 'Потеряно',
    idea: 'Идея',
    draft: 'Черновик',
    published: 'Опубликовано',
    active: 'Активен',
    inactive: 'Неактивен',
    churned: 'Ушёл',
};

export default function KanbanView({
    entityId,
    fields,
    config,
}: KanbanViewProps) {
    const [records, setRecords] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [openedRecord, setOpenedRecord] = useState<EntityRecord | null>(null);
    const [quickCreateColumn, setQuickCreateColumn] = useState<string | null>(
        null,
    );

    const groupField = config.groupBy as string | undefined;
    const groupFieldDef = groupField
        ? fields.find((f) => f.name === groupField)
        : undefined;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
            const choices = (groupFieldDef.options as { choices: string[] })
                .choices;
            return choices.map((c) => ({
                key: c,
                label: COLUMN_LABELS[c] ?? c,
            }));
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

        setRecords((prev) =>
            prev.map((r) =>
                r.id === recordId
                    ? { ...r, data: { ...r.data, [groupFieldDef.name]: newColumn } }
                    : r,
            ),
        );

        try {
            await api.updateRecord(recordId, {
                ...record.data,
                [groupFieldDef.name]: newColumn,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
            await loadRecords();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить карточку?')) return;
        try {
            await api.deleteRecord(id);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleQuickCreate = async (data: Record<string, unknown>) => {
        try {
            await api.createRecord(entityId, data);
            setQuickCreateColumn(null);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        }
    };

    const handleUpdateRecord = async (id: string, data: Record<string, unknown>) => {
        try {
            await api.updateRecord(id, data);
            setOpenedRecord(null);
            await loadRecords();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

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
                <p>Создай поле типа «Список» (например, «Статус»).</p>
            </div>
        );
    }

    const activeRecord = activeId
        ? records.find((r) => r.id === activeId)
        : null;

    // Счётчики
    const total = records.length;
    const inProgress = records.filter((r) => {
        const c = getRecordColumn(r);
        return c === 'in_progress' || c === 'todo';
    }).length;
    const done = records.filter((r) => getRecordColumn(r) === 'done').length;

    return (
        <>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    {columns.map((col) => {
                        const colRecords = records.filter(
                            (r) => getRecordColumn(r) === col.key,
                        );

                        return (
                            <KanbanColumn
                                key={col.key}
                                column={col}
                                records={colRecords}
                                fields={fields}
                                onDelete={handleDelete}
                                onOpen={(r) => setOpenedRecord(r)}
                                onQuickCreate={() => setQuickCreateColumn(col.key)}
                                activeId={activeId}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeRecord && (
                        <div className="kanban-card kanban-card-dragging">
                            <div className="kanban-card-title">
                                {String(
                                    activeRecord.data[fields[0]?.name ?? 'title'] ?? 'Карточка',
                                )}
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Счётчики */}
            <div className="kanban-stats">
                <div className="kanban-stat">
                    <span className="kanban-stat-label">Всего:</span>
                    <span className="kanban-stat-value">{total}</span>
                </div>
                <div className="kanban-stat">
                    <Clock size={14} />
                    <span className="kanban-stat-label">В работе:</span>
                    <span className="kanban-stat-value">{inProgress}</span>
                </div>
                <div className="kanban-stat">
                    <span className="kanban-stat-label">Готово:</span>
                    <span className="kanban-stat-value kanban-stat-value-success">
                        {done}
                    </span>
                </div>
            </div>

            {/* Быстрая форма создания */}
            {quickCreateColumn && (
                <TaskQuickForm
                    fields={fields}
                    initialStatus={{
                        field: groupFieldDef.name,
                        value: quickCreateColumn,
                    }}
                    onSubmit={handleQuickCreate}
                    onCancel={() => setQuickCreateColumn(null)}
                />
            )}

            {/* Попап карточки */}
            {openedRecord && (
                <TaskDetailPopup
                    record={openedRecord}
                    fields={fields}
                    onSave={handleUpdateRecord}
                    onClose={() => setOpenedRecord(null)}
                />
            )}
        </>
    );
}

function KanbanColumn({
    column,
    records,
    fields,
    onDelete,
    onOpen,
    onQuickCreate,
    activeId,
}: {
    column: KanbanColumn;
    records: EntityRecord[];
    fields: Field[];
    onDelete: (id: string) => void;
    onOpen: (r: EntityRecord) => void;
    onQuickCreate: () => void;
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

            <button className="kanban-column-add" onClick={onQuickCreate}>
                <Plus size={14} /> Добавить
            </button>

            <div className="kanban-column-body">
                {records.length === 0 ? (
                    <div className="kanban-column-empty">Пусто</div>
                ) : (
                    records.map((record) => (
                        <KanbanCard
                            key={record.id}
                            record={record}
                            fields={fields}
                            onDelete={onDelete}
                            onOpen={onOpen}
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
    onDelete,
    onOpen,
    isDragging,
}: {
    record: EntityRecord;
    fields: Field[];
    onDelete: (id: string) => void;
    onOpen: (r: EntityRecord) => void;
    isDragging: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: record.id,
    });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    const titleField = fields.find((f) => f.name === 'title') ?? fields[0];
    const priorityField = fields.find((f) => f.name === 'priority');
    const assigneeField = fields.find((f) => f.name === 'assignee');
    const dueDateField = fields.find((f) => f.name === 'dueDate');

    const title = titleField
        ? String(record.data[titleField.name] ?? 'Без названия')
        : 'Без названия';

    const priority = priorityField
        ? String(record.data[priorityField.name] ?? '')
        : '';

    const assignee = assigneeField
        ? String(record.data[assigneeField.name] ?? '')
        : '';

    const dueDate = dueDateField
        ? String(record.data[dueDateField.name] ?? '')
        : '';

    const isOverdue =
        dueDate && new Date(dueDate) < new Date() && !isDragging;

    const priorityClass =
        priority === 'urgent'
            ? 'kanban-priority-urgent'
            : priority === 'high'
                ? 'kanban-priority-high'
                : priority === 'medium'
                    ? 'kanban-priority-medium'
                    : '';

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card ${isDragging ? 'kanban-card-ghost' : ''}`}
            style={style}
            {...listeners}
            {...attributes}
        >
            <div className="kanban-card-header">
                <div
                    className="kanban-card-title"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen(record);
                    }}
                >
                    {title}
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

            <div className="kanban-card-meta">
                {priority && (
                    <span className={`kanban-card-priority ${priorityClass}`}>
                        {priority}
                    </span>
                )}
                {assignee && (
                    <span className="kanban-card-assignee">👤 {assignee}</span>
                )}
            </div>

            {dueDate && (
                <div
                    className={`kanban-card-due ${isOverdue ? 'kanban-card-due-overdue' : ''}`}
                >
                    {isOverdue && <AlertCircle size={10} />}
                    <Clock size={10} />
                    {new Date(dueDate).toLocaleDateString('ru-RU')}
                </div>
            )}
        </div>
    );
}