//frontend/src/pages/DashboardPage.tsx
//frontend/src/pages/DashboardPage.tsx
import { useState } from 'react';
import Layout from '../components/Layout';
import ProjectsPage from './dashboard/ProjectsPage';
import WorkspaceDetailPage from './dashboard/WorkspaceDetailPage';
import ProjectDetailPage from './dashboard/ProjectDetailPage';
import ArtifactsPage from './dashboard/artifacts/ArtifactsPage';
import ClientsPage from './dashboard/ClientsPage';
import TeamPage from './dashboard/TeamPage';
import MarketingPage from './dashboard/MarketingPage';
import SeoPage from './dashboard/SeoPage';
import UtmPage from './dashboard/utm/UtmPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import ChartsPage from './dashboard/ChartsPage';

import EntitiesPage from './dashboard/entities/EntitiesPage';
import EntityDetailPage from './dashboard/entities/EntityDetailPage';
type Screen =
    | { type: 'list' }
    | { type: 'utm'; projectId: string; projectName: string }
    | { type: 'workspace'; id: string; label: string }
    | { type: 'project'; id: string; label: string }
    | { type: 'artifacts'; projectId: string; projectName: string }
    | { type: 'entities'; projectId: string; projectName: string }
    | {
        type: 'entity';
        entityId: string;
        entityLabel: string;
        projectId: string;
        projectName: string;
    };

export default function DashboardPage() {
    const [page, setPage] = useState('projects');
    const [screen, setScreen] = useState<Screen>({ type: 'list' });

    const handleNavigate = (newPage: string) => {
        setPage(newPage);
        setScreen({ type: 'list' });
    };

    const renderProjectsArea = () => {
        if (screen.type === 'workspace') {
            return (
                <WorkspaceDetailPage
                    workspaceId={screen.id}
                    workspaceName={screen.label}
                    onBack={() => setScreen({ type: 'list' })}
                    onOpenProject={(id, label) =>
                        setScreen({ type: 'project', id, label })
                    }
                />
            );
        }
        if (screen.type === 'utm') {
            return (
                <UtmPage
                    projectId={screen.projectId}
                    projectName={screen.projectName}
                    onBack={() =>
                        setScreen({
                            type: 'project',
                            id: screen.projectId,
                            label: screen.projectName,
                        })
                    }
                />
            );
        }
        if (screen.type === 'project') {
            return (
                <ProjectDetailPage
                    projectId={screen.id}
                    projectName={screen.label}
                    onBack={() => setScreen({ type: 'list' })}
                    onOpenArtifacts={(projectId, projectName) =>
                        setScreen({ type: 'artifacts', projectId, projectName })
                    }
                    onOpenEntities={(projectId, projectName) =>
                        setScreen({ type: 'entities', projectId, projectName })
                    }
                    onOpenUtm={(projectId, projectName) =>
                        setScreen({ type: 'utm', projectId, projectName })
                    }
                />
            );
        }

        if (screen.type === 'artifacts') {
            return (
                <ArtifactsPage
                    projectId={screen.projectId}
                    projectName={screen.projectName}
                    onBack={() =>
                        setScreen({
                            type: 'project',
                            id: screen.projectId,
                            label: screen.projectName,
                        })
                    }
                />
            );
        }

        if (screen.type === 'entities') {
            return (
                <EntitiesPage
                    projectId={screen.projectId}
                    projectName={screen.projectName}
                    onBack={() =>
                        setScreen({
                            type: 'project',
                            id: screen.projectId,
                            label: screen.projectName,
                        })
                    }
                    onOpenEntity={(entityId, entityLabel) =>
                        setScreen({
                            type: 'entity',
                            entityId,
                            entityLabel,
                            projectId: screen.projectId,
                            projectName: screen.projectName,
                        })
                    }
                />
            );
        }

        if (screen.type === 'entity') {
            return (
                <EntityDetailPage
                    entityId={screen.entityId}
                    entityLabel={screen.entityLabel}
                    onBack={() =>
                        setScreen({
                            type: 'entities',
                            projectId: screen.projectId,
                            projectName: screen.projectName,
                        })
                    }
                />
            );
        }

        return (
            <ProjectsPage
                onOpenWorkspace={(id, label) =>
                    setScreen({ type: 'workspace', id, label })
                }
            />
        );
    };

    const renderPage = () => {
        switch (page) {
            case 'projects':
                return renderProjectsArea();
            case 'artifacts':
                return (
                    <div
                        style={{
                            padding: 40,
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                        }}
                    >
                        Выбери проект → открой артефакты
                    </div>
                );
            case 'clients':
                return <ClientsPage />;
            case 'team':
                return <TeamPage />;
            case 'marketing':
                return <MarketingPage />;
            case 'seo':
                return <SeoPage />;
            case 'utm':
                return (
                    <div
                        style={{
                            padding: 40,
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                        }}
                    >
                        Выбери проект → открой UTM-метки
                    </div>
                );
            case 'analytics':
                return <AnalyticsPage />;
            case 'charts':
                return <ChartsPage />;
            default:
                return renderProjectsArea();
        }
    };

    return (
        <Layout activePage={page} onNavigate={handleNavigate}>
            {renderPage()}
        </Layout>
    );
}