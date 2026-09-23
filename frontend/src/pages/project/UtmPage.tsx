//frontend/src/pages/project/UtmPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Link, Zap, Radio, Megaphone, Target, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Artifact } from '../../types/api';
import SourcesTab from '../../features/utm/SourcesTab';
import MediumsTab from '../../features/utm/MediumsTab';
import CampaignsTab from '../../features/utm/CampaignsTab';
import RulesTab from '../../features/utm/RulesTab';
import GeneratorTab from '../../features/utm/GeneratorTab';
import LinksTab from '../../features/utm/LinksTab';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './UtmPage.css';

type Tab = 'generator' | 'links' | 'sources' | 'mediums' | 'campaigns' | 'rules';

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: 'generator', label: 'Генератор', icon: Zap },
    { key: 'links', label: 'Ссылки', icon: Link },
    { key: 'sources', label: 'Источники', icon: Radio },
    { key: 'mediums', label: 'Каналы', icon: Megaphone },
    { key: 'campaigns', label: 'Кампании', icon: Target },
    { key: 'rules', label: 'Правила', icon: Settings },
];

export default function UtmPage() {
    const { projectId, projectName } = useOutletContext<ProjectContext>();
    const [tab, setTab] = useState<Tab>('generator');
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api
            .getArtifacts(projectId)
            .then(setArtifacts)
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load'),
            );
    }, [projectId]);

    return (
        <div className="utm-page">
            <h1 className="utm-title">
                <span className="utm-title-icon">
                    <Link size={22} color="#fff" strokeWidth={2.5} />
                </span>
                UTM-метки · {projectName}
            </h1>
            {error && <div className="utm-error">{error}</div>}
            <div className="utm-tabs">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.key}
                            className={`utm-tab ${tab === t.key ? 'utm-tab-active' : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            <Icon size={14} />
                            {t.label}
                        </button>
                    );
                })}
            </div>
            <div className="utm-content">
                {tab === 'generator' && <GeneratorTab projectId={projectId} artifacts={artifacts} />}
                {tab === 'links' && <LinksTab projectId={projectId} />}
                {tab === 'sources' && <SourcesTab projectId={projectId} />}
                {tab === 'mediums' && <MediumsTab projectId={projectId} />}
                {tab === 'campaigns' && <CampaignsTab projectId={projectId} />}
                {tab === 'rules' && <RulesTab projectId={projectId} />}
            </div>
        </div>
    );
}