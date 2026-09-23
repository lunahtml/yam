//frontend\src\features\utm\MediumsTab.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { UtmMedium } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import InfoPopup from '../../components/InfoPopup';
import './MediumsTab.css';

interface MediumsTabProps {
    projectId: string;
}

export default function MediumsTab({ projectId }: MediumsTabProps) {
    const [mediums, setMediums] = useState<UtmMedium[]>([]);
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const data = await api.getMediums(projectId);
            setMediums(data);
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
            await api.createMedium(projectId, {
                name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                label: label.trim(),
            });
            setName('');
            setLabel('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить канал?')) return;
        try {
            await api.deleteMedium(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    return (
        <div className="mediums-tab">
            <div className="mediums-grid">
                {/* Форма */}
                <div className="mediums-form-card">
                    <div className="mediums-form-header">
                        <h3 className="mediums-form-title">
                            <Plus size={18} /> Новый канал
                        </h3>
                        <InfoPopup title="Что такое канал (utm_medium)?">
                            <p>
                                <strong>Канал</strong> — это <strong>каким способом</strong>{' '}
                                пришёл человек.
                            </p>
                            <p>
                                <strong>Разница с источником:</strong>
                            </p>
                            <ul>
                                <li>
                                    <strong>source</strong> — откуда именно (Telegram, VK)
                                </li>
                                <li>
                                    <strong>medium</strong> — каким способом (соцсети, реклама, email)
                                </li>
                            </ul>
                            <p>Примеры:</p>
                            <ul>
                                <li>
                                    <code>social</code> — соцсети
                                </li>
                                <li>
                                    <code>cpc</code> — платная реклама
                                </li>
                                <li>
                                    <code>email</code> — email-рассылка
                                </li>
                                <li>
                                    <code>banner</code> — баннер
                                </li>
                                <li>
                                    <code>referral</code> — переходы по ссылкам
                                </li>
                                <li>
                                    <code>organic</code> — органика
                                </li>
                            </ul>
                            <p>
                                <strong>Пример вместе:</strong>
                            </p>
                            <div className="example">
                                utm_source=telegram&utm_medium=social
                            </div>
                            <p>
                                Человек пришёл <strong>из Telegram</strong>, через{' '}
                                <strong>соцсети</strong>.
                            </p>
                        </InfoPopup>
                    </div>

                    <Input
                        label="Название (латиница, snake_case)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="social"
                    />
                    <Input
                        label="Отображаемое имя"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Соцсети"
                    />

                    <Button onClick={handleCreate} loading={loading}>
                        <Plus size={16} /> Создать
                    </Button>
                </div>

                {/* Список */}
                <div className="mediums-list-card">
                    <h3 className="mediums-list-title">Каналы ({mediums.length})</h3>

                    {error && <div className="mediums-error">{error}</div>}

                    {mediums.length === 0 ? (
                        <p className="mediums-empty">Пока нет каналов</p>
                    ) : (
                        <div className="mediums-list">
                            {mediums.map((m) => (
                                <div key={m.id} className="mediums-item">
                                    <div className="mediums-item-content">
                                        <div className="mediums-item-label">{m.label}</div>
                                        <div className="mediums-item-name">
                                            {m.name}
                                            {m.isSystem && (
                                                <span className="mediums-item-badge">системный</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="mediums-item-delete"
                                        onClick={() => handleDelete(m.id)}
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