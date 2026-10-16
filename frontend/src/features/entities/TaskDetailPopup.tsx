//frontend/src/features/entities/TaskDetailPopup.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, ExternalLink } from 'lucide-react';
import { api } from '../../api/client';
import { EntityRecord, Field } from '../../types/api';
import CommentsSection from '../comments/CommentsSection';
import RecordFieldsEditor from './RecordFieldsEditor';
import './TaskDetailPopup.css';

interface TaskDetailPopupProps {
    record: EntityRecord;
    fields: Field[];
    onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
}

export default function TaskDetailPopup({
    record,
    fields,
    onSave,
    onClose,
}: TaskDetailPopupProps) {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [data, setData] = useState<Record<string, unknown>>(record.data);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [organizationId, setOrganizationId] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');

    const update = (name: string, value: unknown) => {
        setData({ ...data, [name]: value });
    };

    useEffect(() => {
        if (!record.projectId) return;

        api
            .getMe()
            .then((me) => setCurrentUserId(me.id))
            .catch(() => { });

        api
            .getProject(record.projectId)
            .then(async (project) => {
                if (project?.workspaceId) {
                    const ws = await api.getWorkspace(project.workspaceId);
                    if (ws?.organizationId) {
                        setOrganizationId(ws.organizationId);
                    }
                }
            })
            .catch(() => { });
    }, [record.projectId]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await onSave(record.id, data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenPage = () => {
        if (!projectId) return;
        navigate(`/projects/${projectId}/tasks/${record.id}`);
    };

    return (
        <div className="task-detail-overlay" onClick={onClose}>
            <div className="task-detail" onClick={(e) => e.stopPropagation()}>
                <div className="task-detail-header">
                    <h3 className="task-detail-title">Карточка</h3>
                    <div className="task-detail-header-actions">
                        <button
                            className="task-detail-open-page"
                            onClick={handleOpenPage}
                            title="Открыть на отдельной странице"
                        >
                            <ExternalLink size={16} />
                            Открыть
                        </button>
                        <button className="task-detail-close" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {error && <div className="task-detail-error">{error}</div>}

                <div className="task-detail-body">
                    <RecordFieldsEditor
                        fields={fields}
                        data={data}
                        onChange={update}
                        organizationId={organizationId}
                    />
                </div>

                <div className="task-detail-footer">
                    <button
                        className="task-detail-btn task-detail-btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                        className="task-detail-btn task-detail-btn-secondary"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </div>

                <div className="task-detail-meta">
                    Создано: {new Date(record.createdAt).toLocaleString('ru-RU')}
                    {record.creator && ` · ${record.creator.name ?? record.creator.email}`}
                </div>

                {currentUserId && (
                    <div className="task-detail-comments">
                        <CommentsSection
                            recordId={record.id}
                            currentUserId={currentUserId}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}