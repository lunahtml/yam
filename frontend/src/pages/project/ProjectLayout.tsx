//frontend/src/pages/project/ProjectLayout.tsx
import { useState } from 'react';
import {
    LayoutDashboard,
    ListTodo,
    Link2,
    Target,
    Megaphone,
    Search,
    Users,
    BarChart3,
    LineChart,
    UserCog,
    Rocket,
    Settings,
    ArrowLeft,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import OverviewPage from './OverviewPage';
import TasksPage from './TasksPage';
import ArtifactsPage from './ArtifactsPage';
import UtmPage from './UtmPage';
import MarketingPage from './MarketingPage';
import SeoPage from './SeoPage';
import ClientsPage from './ClientsPage';
import AnalyticsPage from './AnalyticsPage';
import ChartsPage from './ChartsPage';
import TeamPage from './TeamPage';
import SprintsPage from './SprintsPage';
import SprintDetailPage from './SprintDetailPage';
import SettingsPage from './SettingsPage';
import SkillsPage from './SkillsPage';
import { useEffect } from 'react';
import { api } from '../../api/client';
import './ProjectLayout.css';

interface ProjectLayoutProps {
    projectId: string;
    projectName: string;
    onBack: () => void;
}

type Section =
    | 'overview'
    | 'tasks'
    | 'artifacts'
    | 'utm'
    | 'marketing'
    | 'seo'
    | 'clients'
    | 'analytics'
    | 'charts'
    | 'team'
    | 'sprints'
    | 'skills'
    | 'settings';

interface MenuItem {
    key: Section;
    label: string;
    icon: LucideIcon;
}

const MENU: MenuItem[] = [
    { key: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { key: 'sprints', label: 'Спринты', icon: Rocket },
    { key: 'tasks', label: 'Задачи', icon: ListTodo },
    { key: 'artifacts', label: 'Артефакты', icon: Link2 },
    { key: 'utm', label: 'UTM-метки', icon: Target },
    { key: 'marketing', label: 'Маркетинг', icon: Megaphone },
    { key: 'seo', label: 'SEO', icon: Search },
    { key: 'skills', label: 'Навыки', icon: Sparkles },
    { key: 'clients', label: 'Клиенты', icon: Users },
    { key: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { key: 'charts', label: 'Чарты', icon: LineChart },
    { key: 'team', label: 'Команда', icon: UserCog },
    { key: 'settings', label: 'Настройки', icon: Settings },
];

export default function ProjectLayout({
    projectId,
    projectName,
    onBack,
}: ProjectLayoutProps) {
    const [active, setActive] = useState<Section>('overview');
    const [organizationId, setOrganizationId] = useState<string>('');

    useEffect(() => {
        api
            .getProject(projectId)
            .then(async (project: any) => {
                if (project?.workspaceId) {
                    const workspace = await api.getWorkspace(project.workspaceId);
                    if (workspace?.organizationId) {
                        setOrganizationId(workspace.organizationId);
                    }
                }
            })
            .catch(() => { });
    }, [projectId]);
    const [activeSprint, setActiveSprint] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const renderContent = () => {
        switch (active) {
            case 'overview':
                return (
                    <OverviewPage projectId={projectId} projectName={projectName} />
                );
            case 'sprints':
                if (activeSprint) {
                    return (
                        <SprintDetailPage
                            sprintId={activeSprint.id}
                            sprintName={activeSprint.name}
                            onBack={() => setActiveSprint(null)}
                        />
                    );
                }
                return (
                    <SprintsPage
                        projectId={projectId}
                        onOpenSprint={(id, name) => setActiveSprint({ id, name })}
                    />
                );
            case 'tasks':
                return <TasksPage projectId={projectId} />;
            case 'artifacts':
                return (
                    <ArtifactsPage projectId={projectId} projectName={projectName} />
                );
            case 'utm':
                return <UtmPage projectId={projectId} projectName={projectName} />;
            case 'marketing':
                return <MarketingPage projectId={projectId} />;
            case 'seo':
                return <SeoPage />;
            case 'clients':
                return <ClientsPage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'charts':
                return <ChartsPage />;
            case 'team':
                return <TeamPage />;
            case 'skills':
                if (!organizationId) {
                    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Загрузка...</div>;
                }
                return <SkillsPage organizationId={organizationId} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return (
                    <OverviewPage projectId={projectId} projectName={projectName} />
                );
        }
    };

    return (
        <div className="project-layout">
            <aside className="project-sidebar">
                <div className="project-sidebar-header">
                    <div className="project-sidebar-logo">
                        <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div className="project-sidebar-title">
                        <div className="project-sidebar-name">YAM</div>
                        <div className="project-sidebar-project">{projectName}</div>
                    </div>
                </div>

                <nav className="project-sidebar-nav">
                    {MENU.map((item) => {
                        const Icon = item.icon;
                        const isActive = active === item.key;

                        return (
                            <button
                                key={item.key}
                                className={`project-sidebar-item ${isActive ? 'project-sidebar-item-active' : ''}`}
                                onClick={() => setActive(item.key)}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="project-sidebar-footer">
                    <button className="project-sidebar-back" onClick={onBack}>
                        <ArrowLeft size={16} />
                        Все проекты
                    </button>
                </div>
            </aside>

            <main className="project-main">{renderContent()}</main>
        </div>
    );
}