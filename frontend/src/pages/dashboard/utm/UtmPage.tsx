//frontend/src/pages/dashboard/utm/UtmPage.tsx
import { useEffect, useState } from 'react';
import { Link, ArrowLeft } from 'lucide-react';
import { api } from '../../../api/client';
import { Artifact } from '../../../types/api';
import SourcesTab from './SourcesTab';
import MediumsTab from './MediumsTab';
import CampaignsTab from './CampaignsTab';
import RulesTab from './RulesTab';
import GeneratorTab from './GeneratorTab';
import LinksTab from './LinksTab';
import './UtmPage.css';

interface UtmPageProps {
    projectId: string;
    projectName: string;
    onBack?: () => void;
}

type Tab = 'generator' | 'links' | 'sources' | 'mediums' | 'campaigns' | 'rules';

const TABS: { key: Tab; label: string }[] = [
    { key: 'generator', label: '🎯 Генератор' },
    { key: 'links', label: '🔗 Ссылки' },
    { key: 'sources', label: '📡 Источники' },
    { key: 'mediums', label: '📢 Каналы' },
    { key: 'campaigns', label: '🎪 Кампании' },
    { key: 'rules', label: '⚙️ Правила' },
];

export default function UtmPage({
    projectId,
    projectName,
    onBack,
}: UtmPageProps) {
    const [tab, setTab] = useState<Tab>('generator');
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .getArtifacts(projectId)
            .then((data) => setArtifacts(data))
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load'),
            );
    }, [projectId]);

    return (
        <div className="utm-page">
            {onBack && (
                <button className="utm-back" onClick={onBack}>
                    <ArrowLeft size={16} />
                    Назад к проекту
                </button>
            )}

            <h1 className="utm-title">
                <span className="utm-title-icon">
                    <Link size={22} color="#fff" strokeWidth={2.5} />
                </span>
                UTM-метки · {projectName}
            </h1>

            {error && <div className="utm-error">{error}</div>}

            <div className="utm-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`utm-tab ${tab === t.key ? 'utm-tab-active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="utm-content">
                {tab === 'generator' && (
                    <GeneratorTab projectId={projectId} artifacts={artifacts} />
                )}
                {tab === 'links' && <LinksTab projectId={projectId} />}
                {tab === 'sources' && <SourcesTab projectId={projectId} />}
                {tab === 'mediums' && <MediumsTab projectId={projectId} />}
                {tab === 'campaigns' && <CampaignsTab projectId={projectId} />}
                {tab === 'rules' && <RulesTab projectId={projectId} />}
            </div>
        </div>
    );
}