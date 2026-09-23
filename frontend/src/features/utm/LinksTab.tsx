//frontend\src\features\utm\LinksTab.tsx
import { useEffect, useState } from 'react';
import {
    Copy,
    Check,
    Trash2,
    Download,
    ExternalLink,
    Search,
} from 'lucide-react';
import { api } from '../../api/client';
import { UtmCampaign, UtmLink } from '../../types/api';
import InfoPopup from '../../components/InfoPopup';
import './LinksTab.css';

interface LinksTabProps {
    projectId: string;
}

export default function LinksTab({ projectId }: LinksTabProps) {
    const [links, setLinks] = useState<UtmLink[]>([]);
    const [campaigns, setCampaigns] = useState<UtmCampaign[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Фильтры
    const [search, setSearch] = useState('');
    const [filterCampaign, setFilterCampaign] = useState<string>('');

    const load = async () => {
        setLoading(true);
        try {
            const [linksData, campaignsData] = await Promise.all([
                api.getLinks(projectId),
                api.getCampaigns(projectId),
            ]);
            setLinks(linksData);
            setCampaigns(campaignsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [projectId]);

    const handleCopy = async (id: string, url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить ссылку?')) return;
        try {
            await api.deleteLink(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        }
    };

    const handleExportCsv = () => {
        const header =
            'Дата,Артефакт,Source,Medium,Campaign,Content,URL,Название\n';
        const rows = filteredLinks
            .map((l) => {
                const date = new Date(l.createdAt).toLocaleDateString('ru-RU');
                const artifact = l.artifact?.name ?? '';
                return `${date},"${artifact}","${l.source}","${l.medium}","${l.campaign ?? ''}","${l.content ?? ''}","${l.fullUrl}","${l.label ?? ''}"`;
            })
            .join('\n');

        const blob = new Blob([header + rows], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utm-links-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Фильтрация
    const filteredLinks = links.filter((l) => {
        if (filterCampaign && l.campaignId !== filterCampaign) return false;
        if (search) {
            const q = search.toLowerCase();
            const haystack = `${l.label ?? ''} ${l.fullUrl} ${l.source} ${l.medium} ${l.content ?? ''}`.toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="links-loading">Загрузка...</div>
        );
    }

    return (
        <div className="links-tab">
            <div className="links-header">
                <div className="links-header-title">
                    <h3 className="links-title">Ссылки ({filteredLinks.length})</h3>
                    <InfoPopup title="Что тут">
                        <p>
                            Это все UTM-ссылки проекта. Их можно{' '}
                            <strong>копировать, фильтровать и удалять</strong>.
                        </p>
                        <p>
                            <strong>Что показывает таблица:</strong>
                        </p>
                        <ul>
                            <li>
                                <strong>source</strong> — откуда пришёл человек
                            </li>
                            <li>
                                <strong>medium</strong> — каким способом
                            </li>
                            <li>
                                <strong>campaign</strong> — акция
                            </li>
                            <li>
                                <strong>content</strong> — какая кнопка/пост
                            </li>
                        </ul>
                        <p>
                            <strong>Как использовать:</strong>
                        </p>
                        <ul>
                            <li>Найди нужную ссылку через поиск</li>
                            <li>Нажми «копировать» — она в буфере</li>
                            <li>Вставь в пост, письмо, рекламу</li>
                        </ul>
                        <p>
                            <strong>Совет:</strong> дай ссылке понятное название — потом
                            легче искать.
                        </p>
                    </InfoPopup>
                </div>

                {filteredLinks.length > 0 && (
                    <button className="links-export" onClick={handleExportCsv}>
                        <Download size={14} /> Экспорт CSV
                    </button>
                )}
            </div>

            {/* Фильтры */}
            <div className="links-filters">
                <div className="links-search">
                    <Search size={14} className="links-search-icon" />
                    <input
                        className="links-search-input"
                        placeholder="Поиск по названию, URL, source..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="links-filter-select"
                    value={filterCampaign}
                    onChange={(e) => setFilterCampaign(e.target.value)}
                >
                    <option value="">Все кампании</option>
                    {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="links-error">{error}</div>}

            {filteredLinks.length === 0 ? (
                <div className="links-empty">
                    {links.length === 0
                        ? 'Пока нет UTM-ссылок. Создай первую во вкладке «Генератор».'
                        : 'Ничего не найдено по фильтрам'}
                </div>
            ) : (
                <div className="links-list">
                    {filteredLinks.map((l) => (
                        <div key={l.id} className="links-item">
                            <div className="links-item-header">
                                <div className="links-item-content">
                                    <div className="links-item-label">
                                        {l.label ?? 'Без названия'}
                                    </div>

                                    <div className="links-item-tags">
                                        <span className="links-tag">source: {l.source}</span>
                                        <span className="links-tag">medium: {l.medium}</span>
                                        {l.campaign && (
                                            <span className="links-tag">campaign: {l.campaign}</span>
                                        )}
                                        {l.content && (
                                            <span className="links-tag">content: {l.content}</span>
                                        )}
                                        {l.term && (
                                            <span className="links-tag">term: {l.term}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="links-item-actions">
                                    <button
                                        className="links-item-btn"
                                        onClick={() => handleCopy(l.id, l.fullUrl)}
                                        title="Копировать"
                                    >
                                        {copiedId === l.id ? (
                                            <Check size={14} className="links-item-btn-success" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>

                                    <a
                                        href={l.fullUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="links-item-btn"
                                        title="Открыть"
                                    >
                                        <ExternalLink size={14} />
                                    </a>

                                    <button
                                        className="links-item-btn links-item-btn-danger"
                                        onClick={() => handleDelete(l.id)}
                                        title="Удалить"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="links-item-url">{l.fullUrl}</div>

                            <div className="links-item-meta">
                                {new Date(l.createdAt).toLocaleString('ru-RU')}
                                {l.artifact && ` · ${l.artifact.name}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}