//frontend/src/pages/dashboard/utm/SourcesTab.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../../api/client';
import { UtmSource } from '../../../types/api';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import InfoPopup from '../../../components/InfoPopup';
import './SourcesTab.css';

interface SourcesTabProps {
    projectId: string;
}

export default function SourcesTab({ projectId }: SourcesTabProps) {
    const [sources, setSources] = useState<UtmSource[]>([]);
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [icon, setIcon] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const data = await api.getSources(projectId);
            setSources(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    useEffect(() => {
        load();
    }, [projectId]);

    const handleCreate = async () => {
        if (!name.trim() || !label.trim()) return;
        setLoading(true);
        setError('');

        try {
            await api.createSource(projectId, {
                name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                label: label.trim(),
                icon: icon.trim() || undefined,
            });
            setName('');
            setLabel('');
            setIcon('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить источник?')) return;
        try {
            await api.deleteSource(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    return (
        <div className="sources-tab">
            <div className="sources-grid">
                {/* Форма */}
                <div className="sources-form-card">
                    <div className="sources-form-header">
                        <h3 className="sources-form-title">
                            <Plus size={18} /> Новый источник
                        </h3>
                        <InfoPopup title="Что такое источник (utm_source)?">
                            <p>
                                <strong>Источник</strong> — это <strong>откуда</strong> пришёл
                                человек.
                            </p>
                            <p>Примеры:</p>
                            <ul>
                                <li>
                                    <code>telegram</code> — из Telegram
                                </li>
                                <li>
                                    <code>vk</code> — из VK
                                </li>
                                <li>
                                    <code>yandex</code> — из Яндекс.Директ
                                </li>
                                <li>
                                    <code>google</code> — из Google
                                </li>
                                <li>
                                    <code>email</code> — из email-рассылки
                                </li>
                            </ul>
                            <p>
                                <strong>Правила:</strong>
                            </p>
                            <ul>
                                <li>латиница</li>
                                <li>маленькими буквами</li>
                                <li>snake_case (подчёркивания вместо пробелов)</li>
                            </ul>
                            <div className="example">
                                utm_source=telegram
                            </div>
                        </InfoPopup>
                    </div>

                    <Input
                        label="Название (латиница, snake_case)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="telegram"
                    />
                    <Input
                        label="Отображаемое имя"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Telegram"
                    />
                    <Input
                        label="Иконка (эмодзи, необязательно)"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="✈️"
                    />

                    <Button onClick={handleCreate} loading={loading}>
                        <Plus size={16} /> Создать
                    </Button>
                </div>

                {/* Список */}
                <div className="sources-list-card">
                    <h3 className="sources-list-title">
                        Источники ({sources.length})
                    </h3>

                    {error && <div className="sources-error">{error}</div>}

                    {sources.length === 0 ? (
                        <p className="sources-empty">Пока нет источников</p>
                    ) : (
                        <div className="sources-list">
                            {sources.map((s) => (
                                <div key={s.id} className="sources-item">
                                    <span className="sources-item-icon">{s.icon ?? '📡'}</span>
                                    <div className="sources-item-content">
                                        <div className="sources-item-label">{s.label}</div>
                                        <div className="sources-item-name">
                                            {s.name}
                                            {s.isSystem && (
                                                <span className="sources-item-badge">системный</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="sources-item-delete"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        <Trash2 size={14} />
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