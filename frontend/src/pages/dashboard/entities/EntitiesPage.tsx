//frontend/src/pages/dashboard/entities/EntitiesPage.tsx
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Database,
    Plus,
    Table2,
    Trash2,
    ListChecks,
    LayoutTemplate,
} from 'lucide-react';
import { api } from '../../../api/client';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import './EntitiesPage.css';
import { Entity, EntityTemplate } from '../../../types/api';
interface EntitiesPageProps {
    projectId: string;
    projectName: string;
    onBack: () => void;
    onOpenEntity: (entityId: string, entityLabel: string) => void;
}

// interface EntityTemplate {
//     key: string;
//     label: string;
//     description: string;
//     icon: string;
//     entity: { name: string; label: string; icon: string };
//     fields: { name: string; label: string; type: string }[];
// }

export default function EntitiesPage({
    projectId,
    projectName,
    onBack,
    onOpenEntity,
}: EntitiesPageProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [templates, setTemplates] = useState<EntityTemplate[]>([]);
    const [mode, setMode] = useState<'list' | 'templates' | 'custom'>('list');
    const [newName, setNewName] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadEntities = async () => {
        try {
            const data = await api.getEntities(projectId);
            setEntities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        }
    };

    const loadTemplates = async () => {
        try {
            const data = await api.getEntityTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        }
    };

    useEffect(() => {
        loadEntities();
        loadTemplates();
    }, [projectId]);

    const handleCreateFromTemplate = async (templateKey: string) => {
        setLoading(true);
        setError('');

        try {
            const entity = await api.createEntityFromTemplate(projectId, templateKey);
            setMode('list');
            await loadEntities();
            onOpenEntity((entity as Entity).id, (entity as Entity).label);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustom = async () => {
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
            setMode('list');
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
        <div className="entities-page">
            <button className="entities-back" onClick={onBack}>
                <ArrowLeft size={16} />
                Назад к проекту
            </button>

            <h1 className="entities-title">
                <span className="entities-title-icon">
                    <Database size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Сущности проекта {projectName}
            </h1>

            {error && <div className="entities-error">{error}</div>}

            {/* Режим выбора */}
            {mode === 'list' && (
                <div className="entities-actions">
                    <Button onClick={() => setMode('templates')}>
                        <LayoutTemplate size={16} />
                        Создать из шаблона
                    </Button>
                    <Button onClick={() => setMode('custom')} variant="secondary">
                        <Plus size={16} />
                        Своя сущность
                    </Button>
                </div>
            )}

            {mode === 'templates' && (
                <div className="entities-templates">
                    <div className="entities-templates-header">
                        <h2>Выбери шаблон</h2>
                        <button
                            className="entities-templates-close"
                            onClick={() => setMode('list')}
                        >
                            Отмена
                        </button>
                    </div>

                    <div className="entities-templates-grid">
                        {templates.map((t) => (
                            <button
                                key={t.key}
                                className="entities-template-card"
                                onClick={() => handleCreateFromTemplate(t.key)}
                                disabled={loading}
                            >
                                <div className="entities-template-icon">{t.icon}</div>
                                <div className="entities-template-label">{t.label}</div>
                                <div className="entities-template-desc">{t.description}</div>
                                <div className="entities-template-fields">
                                    Поля: {t.fields.map((f) => f.label).join(', ')}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'custom' && (
                <div className="entities-custom">
                    <h3 className="entities-custom-title">Своя сущность</h3>
                    <Input
                        label="Название (латиница, snake_case)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="my_entity"
                    />
                    <Input
                        label="Отображаемое имя"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Моя сущность"
                    />
                    <div className="entities-custom-actions">
                        <Button onClick={handleCreateCustom} loading={loading}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setMode('list')} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {/* Список */}
            <div className="entities-list-card">
                <h3 className="entities-list-title">
                    Сущности ({entities.length})
                </h3>

                {entities.length === 0 ? (
                    <p className="entities-empty">
                        Пока нет сущностей. Создай первую через шаблон или вручную.
                    </p>
                ) : (
                    <div className="entities-list">
                        {entities.map((e) => (
                            <div
                                key={e.id}
                                className="entities-item"
                                onClick={() => onOpenEntity(e.id, e.label)}
                            >
                                <div className="entities-item-content">
                                    <div className="entities-item-header">
                                        <Table2 size={16} />
                                        <span className="entities-item-label">{e.label}</span>
                                        <span className="entities-item-name">{e.name}</span>
                                    </div>
                                    <div className="entities-item-meta">
                                        <span>
                                            <ListChecks
                                                size={12}
                                                style={{ display: 'inline', marginRight: 4 }}
                                            />
                                            Полей: {e._count?.fields ?? 0}
                                        </span>
                                        <span>
                                            <Table2
                                                size={12}
                                                style={{ display: 'inline', marginRight: 4 }}
                                            />
                                            Записей: {e._count?.records ?? 0}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="entities-item-delete"
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        handleDelete(e.id);
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
    );
}