//frontend\src\features\utm\GeneratorTab.tsx
import { useEffect, useState } from 'react';
import { Copy, Check, Sparkles, Zap, ExternalLink } from 'lucide-react';
import { api } from '../../api/client';
import {
    Artifact,
    UtmSource,
    UtmMedium,
    UtmCampaign,
} from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import InfoPopup from '../../components/InfoPopup';
import './GeneratorTab.css';

interface GeneratorTabProps {
    projectId: string;
    artifacts: Artifact[];
}

export default function GeneratorTab({
    projectId,
    artifacts,
}: GeneratorTabProps) {
    const [sources, setSources] = useState<UtmSource[]>([]);
    const [mediums, setMediums] = useState<UtmMedium[]>([]);
    const [campaigns, setCampaigns] = useState<UtmCampaign[]>([]);

    const [baseUrl, setBaseUrl] = useState('');
    const [artifactId, setArtifactId] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [source, setSource] = useState('');
    const [medium, setMedium] = useState('');
    const [content, setContent] = useState('');
    const [term, setTerm] = useState('');
    const [label, setLabel] = useState('');

    const [generated, setGenerated] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        Promise.all([
            api.getSources(projectId),
            api.getMediums(projectId),
            api.getCampaigns(projectId),
        ])
            .then(([s, m, c]) => {
                setSources(s);
                setMediums(m);
                setCampaigns(c);
            })
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load'),
            );
    }, [projectId]);

    const buildUrl = (): string => {
        if (!baseUrl) return '';
        try {
            const url = new URL(baseUrl);
            if (source) url.searchParams.set('utm_source', source);
            if (medium) url.searchParams.set('utm_medium', medium);

            const campaign = campaigns.find((c) => c.id === campaignId);
            if (campaign) url.searchParams.set('utm_campaign', campaign.name);

            if (content) url.searchParams.set('utm_content', content);
            if (term) url.searchParams.set('utm_term', term);

            return url.toString();
        } catch {
            return '';
        }
    };

    useEffect(() => {
        setGenerated(buildUrl());
    }, [baseUrl, source, medium, campaignId, content, term, campaigns]);

    const handleCopy = async () => {
        if (!generated) return;
        await navigator.clipboard.writeText(generated);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!baseUrl || !source || !medium) {
            setError('Заполни URL, источник и канал');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.createLink(projectId, {
                baseUrl,
                source,
                medium,
                campaignId: campaignId || undefined,
                artifactId: artifactId || undefined,
                content: content || undefined,
                term: term || undefined,
                label: label || undefined,
            });
            setMessage('✅ Ссылка сохранена');
            setLabel('');
            setContent('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMany = async () => {
        if (!artifactId || !baseUrl) {
            setError('Выбери артефакт и укажи URL');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const links = await api.generateLinks(projectId, {
                artifactId,
                campaignId: campaignId || undefined,
                baseUrl,
                count: 5,
                contentPrefix: content || 'auto',
            });
            setMessage(`✅ Сгенерировано ${links.length} ссылок`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGenerated = () => {
        if (generated) window.open(generated, '_blank');
    };

    return (
        <div className="generator-tab">
            <div className="generator-grid">
                {/* Форма */}
                <div className="generator-form-card">
                    <div className="generator-form-header">
                        <h3 className="generator-form-title">
                            <Zap size={18} /> Параметры ссылки
                        </h3>
                        <InfoPopup title="Как пользоваться генератором">
                            <p>
                                <strong>Генератор</strong> создаёт UTM-ссылку, которую можно
                                вставить в пост, письмо или рекламу.
                            </p>
                            <p>
                                <strong>Что заполнить:</strong>
                            </p>
                            <ul>
                                <li>
                                    <strong>URL</strong> — куда ведём человека
                                </li>
                                <li>
                                    <strong>Source</strong> — откуда (telegram, vk)
                                </li>
                                <li>
                                    <strong>Medium</strong> — каким способом (social, cpc)
                                </li>
                                <li>
                                    <strong>Campaign</strong> — акция (autumn_sale_2026)
                                </li>
                                <li>
                                    <strong>Content</strong> — какая кнопка/пост
                                </li>
                            </ul>
                            <p>
                                <strong>Пример:</strong>
                            </p>
                            <div className="example">
                                https://site.ru/page?utm_source=telegram&utm_medium=social&utm_campaign=autumn_sale_2026&utm_content=post_01
                            </div>
                            <p>
                                <strong>Совет:</strong> выбери артефакт — URL заполнится сам.
                            </p>
                            <p>
                                <strong>Авто-генерация:</strong> если выбрал артефакт, кнопка
                                создаст сразу 5 ссылок с разными `content`.
                            </p>
                        </InfoPopup>
                    </div>

                    <Input
                        label="URL (куда ведём)"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://site.ru/page"
                    />

                    <div className="generator-field">
                        <label className="generator-label">Артефакт (необязательно)</label>
                        <select
                            className="generator-select"
                            value={artifactId}
                            onChange={(e) => {
                                setArtifactId(e.target.value);
                                const art = artifacts.find((a) => a.id === e.target.value);
                                if (art?.url) setBaseUrl(art.url);
                            }}
                        >
                            <option value="">— Выбери —</option>
                            {artifacts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="generator-field">
                        <label className="generator-label">
                            Источник (utm_source)
                        </label>
                        <select
                            className="generator-select"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        >
                            <option value="">— Выбери —</option>
                            {sources.map((s) => (
                                <option key={s.id} value={s.name}>
                                    {s.icon ?? ''} {s.label} ({s.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="generator-field">
                        <label className="generator-label">Канал (utm_medium)</label>
                        <select
                            className="generator-select"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                        >
                            <option value="">— Выбери —</option>
                            {mediums.map((m) => (
                                <option key={m.id} value={m.name}>
                                    {m.label} ({m.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="generator-field">
                        <label className="generator-label">
                            Кампания (utm_campaign)
                        </label>
                        <select
                            className="generator-select"
                            value={campaignId}
                            onChange={(e) => setCampaignId(e.target.value)}
                        >
                            <option value="">— Не выбрана —</option>
                            {campaigns.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Контент (utm_content)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="button_top"
                    />

                    <Input
                        label="Термин (utm_term)"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="ключевое_слово"
                    />

                    <Input
                        label="Название ссылки (для себя)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Пост в Telegram #1"
                    />

                    <div className="generator-actions">
                        <Button onClick={handleSave} loading={loading}>
                            <Sparkles size={16} /> Сохранить
                        </Button>
                        {artifactId && (
                            <Button
                                onClick={handleGenerateMany}
                                loading={loading}
                                variant="secondary"
                            >
                                ⚡ Авто-генерация (5 шт)
                            </Button>
                        )}
                    </div>
                </div>

                {/* Предпросмотр */}
                <div className="generator-preview-card">
                    <h3 className="generator-preview-title">🎯 Итоговая ссылка</h3>

                    {error && <div className="generator-error">{error}</div>}
                    {message && <div className="generator-message">{message}</div>}

                    {generated ? (
                        <>
                            <div className="generator-url">{generated}</div>

                            <div className="generator-preview-actions">
                                <Button onClick={handleCopy} variant="secondary">
                                    {copied ? (
                                        <>
                                            <Check size={16} /> Скопировано
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} /> Скопировать
                                        </>
                                    )}
                                </Button>

                                <Button onClick={handleOpenGenerated} variant="secondary">
                                    <ExternalLink size={16} /> Открыть
                                </Button>
                            </div>

                            <div className="generator-preview-hint">
                                Проверь ссылку перед вставкой в пост или рекламу
                            </div>
                        </>
                    ) : (
                        <div className="generator-preview-empty">
                            Заполни поля слева — ссылка появится здесь
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}