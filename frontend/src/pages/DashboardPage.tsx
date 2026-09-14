//frontend\src\Dashboard.tsx
import { useState } from 'react';
import Layout from '../components/Layout';
import ProjectsPage from './dashboard/ProjectsPage';
import ClientsPage from './dashboard/ClientsPage';
import TeamPage from './dashboard/TeamPage';
import MarketingPage from './dashboard/MarketingPage';
import SeoPage from './dashboard/SeoPage';
import UtmPage from './dashboard/UtmPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import ChartsPage from './dashboard/ChartsPage';

export default function DashboardPage() {
    const [page, setPage] = useState('projects');

    const renderPage = () => {
        switch (page) {
            case 'projects': return <ProjectsPage />;
            case 'clients': return <ClientsPage />;
            case 'team': return <TeamPage />;
            case 'marketing': return <MarketingPage />;
            case 'seo': return <SeoPage />;
            case 'utm': return <UtmPage />;
            case 'analytics': return <AnalyticsPage />;
            case 'charts': return <ChartsPage />;
            default: return <ProjectsPage />;
        }
    };

    return (
        <Layout activePage={page} onNavigate={setPage}>
            {renderPage()}
        </Layout>
    );
}