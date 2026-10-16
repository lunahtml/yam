//frontend/src/pages/project/TaskDetailPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckSquare,
    Pencil,
    Save,
    X,
    Copy,
    Check,
    Calendar,
    Layers,
    Zap,
    User as UserIcon,
} from 'lucide-react';
import { api } from '../../api/client';
import { EntityRecord, Field, Sprint } from '../../types/api';
import RecordFieldsEditor from '../../features/entities/RecordFieldsEditor';
import CommentsSection from '../../features/comments/CommentsSection';
import Button from '../../components/Button';
import './TaskDetailPage.css';

export default function TaskDetailPage() {
    const { projectId, recordId } = useParams<{
        projectId: string;
        recordId: string;
    }>();
    const navigate = useNavigate();

    const [record, setRecord] = useState<EntityRecord | null>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [organizationId, setOrganizationId] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [entityLabel, setEntityLabel] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Record<string, unknown>>({});
    const [copied, setCopied] = useState(false);

    const load = useCallback(async () => {
        if (!recordId || !projectId) return;
        setLoading(true);
        setError('');
        try {
            const rec = await api.getRecord(recordId);
            setRecord(rec);
            setDraft(rec.data);

            const [entity, me, project] = await Promise.all([
                api.getEntity(rec.entityId),
                api.getMe(),
                api.getProject(projectId),
            ]);

            setFields(entity.fields ?? []);
            setEntityLabel(entity.label);
            setCurrentUserId(me.id);

            if (project?.workspaceId) {
                const ws = await api.getWorkspace(project.workspaceId);
                if (ws?.organizationId) setOrganizationId(ws.organizationId);
            }

            if (rec.sprintId) {
                try {
                    const s = await api.getSprint(rec.sprintId);
                    setSprint(s);
                } catch {
                    setSprint(null);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [recordId, projectId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async () => {
        if (!record) return;
        setSaving(true);
        setError('');
        try {
            await api.updateRecord(record.id, draft);
            setEditing(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (record) setDraft(record.data);
        setEditing(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: игнорируем
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    if (loading) {
        return <div className="task-page-loading">Загрузка...</div>;
    }

    if (!record) {
        return <div className="task-page-error">{error || 'Not found'}</div>;
    }

    const title = String(record.data.title ?? record.data.name ?? 'Без названия');

    return (
        <div className="task-page">
            <button className="task-page-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Назад
            </button>

            <div className="task-page-header">
                <h1 className="task-page-title">
                    <span className="task-page-title-icon">
                        <CheckSquare size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    {title}
                </h1>

                <div className="task-page-header-actions">
                    <button
                        className="task-page-copy-btn"
                        onClick={handleCopyLink}
                        title="Скопировать ссылку"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Скопировано' : 'Ссылка'}
                    </button>

                    {!editing && (
                        <button
                            className="task-page-edit-btn"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil size={16} />
                            Редактировать
                        </button>
                    )}
                </div>
            </div>

            <div className="task-page-meta">
                <span className="task-page-entity-badge">
                    <Layers size={12} />
                    {entityLabel}
                </span>

                {sprint && (
                    <span className="task-page-sprint-badge">
                        <Zap size={12} />
                        Спринт #{sprint.number} · {sprint.name}
                    </span>
                )}

                <span className="task-page-date">
                    <Calendar size={12} />
                    Создано: {formatDate(record.createdAt)}
                </span>

                {record.creator && (
                    <span className="task-page-author">
                        <UserIcon size={12} />
                        {record.creator.name ?? record.creator.email}
                    </span>
                )}
            </div>

            {error && <div className="task-page-error-banner">{error}</div>}

            <div className="task-page-body">
                <div className="task-page-fields">
                    {editing ? (
                        <>
                            <RecordFieldsEditor
                                fields={fields}
                                data={draft}
                                onChange={(name, value) =>
                                    setDraft({ ...draft, [name]: value })
                                }
                                organizationId={organizationId}
                            />

                            <div className="task-page-edit-actions">
                                <Button onClick={handleSave} loading={saving}>
                                    <Save size={16} /> Сохранить
                                </Button>
                                <Button onClick={handleCancel} variant="secondary">
                                    <X size={16} /> Отмена
                                </Button>
                            </div>
                        </>
                    ) : (
                        <RecordFieldsEditor
                            fields={fields}
                            data={record.data}
                            onChange={() => { }}
                            organizationId={organizationId}
                            readOnly
                        />
                    )}
                </div>

                <div className="task-page-comments">
                    {currentUserId && (
                        <CommentsSection
                            recordId={record.id}
                            currentUserId={currentUserId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}