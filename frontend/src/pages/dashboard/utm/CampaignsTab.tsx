//frontend/src/pages/dashboard/utm/CampaignsTab.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { api } from '../../../api/client';
import { UtmCampaign } from '../../../types/api';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import InfoPopup from '../../../components/InfoPopup';
import './CampaignsTab.css';

interface CampaignsTabProps {
    projectId: string;
}

export default function CampaignsTab({ projectId }: CampaignsTabProps) {
    const [campaigns, setCampaigns] = useState<UtmCampaign[]>([]);
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const data = await api.getCampaigns(projectId);
            setCampaigns(data);
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
            await api.createCampaign(projectId, {
                name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                label: label.trim(),
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setName('');
            setLabel('');
            setStartDate('');
            setEndDate('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить кампанию?')) return;
        try {
            await api.deleteCampaign(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU');

    return (
        <div className="campaigns-tab">
            <div className="campaigns-grid">
                {/* Форма */}
                <div className="campaigns-form-card">
                    <div className="campaigns-form-header">
                        <h3 className="campaigns-form-title">
                            <Plus size={18} /> Новая кампания
                        </h3>
                        <InfoPopup title="Что такое кампания (utm_campaign)?">
                            <p>
                                <strong>Кампания</strong> — это название конкретной акции,
                                мероприятия или рекламной волны.
                            </p>
                            <p>
                                Одна кампания = <strong>одно имя</strong> для всех каналов.
                            </p>
                            <p>Примеры:</p>
                            <ul>
                                <li>
                                    <code>autumn_sale_2026</code> — осенняя распродажа 2026
                                </li>
                                <li>
                                    <code>webinar_nov</code> — вебинар в ноябре
                                </li>
                                <li>
                                    <code>new_year_promo</code> — новогодняя акция
                                </li>
                                <li>
                                    <code>product_launch</code> — запуск продукта
                                </li>
                            </ul>
                            <p>
                                <strong>Зачем:</strong> чтобы в аналитике видеть,{' '}
                                <strong>какая акция</strong> принесла больше всего.
                            </p>
                            <p>
                                <strong>Совет:</strong> используй год и месяц в имени, чтобы
                                потом не путаться.
                            </p>
                            <div className="example">
                                utm_campaign=autumn_sale_2026
                            </div>
                        </InfoPopup>
                    </div>

                    <Input
                        label="Название (латиница, snake_case)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="autumn_sale_2026"
                    />
                    <Input
                        label="Отображаемое имя"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Осенняя распродажа 2026"
                    />
                    <Input
                        label="Дата начала (необязательно)"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                        label="Дата окончания (необязательно)"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <Button onClick={handleCreate} loading={loading}>
                        <Plus size={16} /> Создать
                    </Button>
                </div>

                {/* Список */}
                <div className="campaigns-list-card">
                    <h3 className="campaigns-list-title">
                        Кампании ({campaigns.length})
                    </h3>

                    {error && <div className="campaigns-error">{error}</div>}

                    {campaigns.length === 0 ? (
                        <p className="campaigns-empty">Пока нет кампаний</p>
                    ) : (
                        <div className="campaigns-list">
                            {campaigns.map((c) => (
                                <div key={c.id} className="campaigns-item">
                                    <div className="campaigns-item-content">
                                        <div className="campaigns-item-label">{c.label}</div>
                                        <div className="campaigns-item-name">{c.name}</div>

                                        {(c.startDate || c.endDate) && (
                                            <div className="campaigns-item-dates">
                                                <Calendar size={11} />
                                                {c.startDate ? formatDate(c.startDate) : '—'}
                                                {' → '}
                                                {c.endDate ? formatDate(c.endDate) : '—'}
                                            </div>
                                        )}

                                        {c._count && c._count.utmLinks > 0 && (
                                            <div className="campaigns-item-links">
                                                Ссылок: {c._count.utmLinks}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="campaigns-item-delete"
                                        onClick={() => handleDelete(c.id)}
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