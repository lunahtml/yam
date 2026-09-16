//frontend/src/pages/DashboardPage.tsx
import { useState } from 'react';
import Layout from '../components/Layout';
import ProjectsPage from './dashboard/ProjectsPage';
import WorkspaceDetailPage from './dashboard/WorkspaceDetailPage';
import ProjectDetailPage from './dashboard/ProjectDetailPage';
import ClientsPage from './dashboard/ClientsPage';
import TeamPage from './dashboard/TeamPage';
import MarketingPage from './dashboard/MarketingPage';
import SeoPage from './dashboard/SeoPage';
import UtmPage from './dashboard/UtmPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import ChartsPage from './dashboard/ChartsPage';

type Screen =
    | { type: 'list' }
    | { type: 'workspace'; id: string; label: string }
    | { type: 'project'; id: string; label: string };

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

        if (screen.type === 'project') {
            return (
                <ProjectDetailPage
                    projectId={screen.id}
                    projectName={screen.label}
                    onBack={() => setScreen({ type: 'list' })}
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
            case 'clients':
                return <ClientsPage />;
            case 'team':
                return <TeamPage />;
            case 'marketing':
                return <MarketingPage />;
            case 'seo':
                return <SeoPage />;
            case 'utm':
                return <UtmPage />;
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