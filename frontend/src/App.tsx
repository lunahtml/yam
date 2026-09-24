//frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import LandingPage from './pages/public/LandingPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';

// Invite
import InviteAcceptPage from './pages/invite/InviteAcceptPage';

// Projects
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProfilePage from './pages/projects/ProfilePage';

// Project inner
import ProjectLayout from './layouts/ProjectLayout';
import OverviewPage from './pages/project/OverviewPage';
import SprintsPage from './pages/project/SprintsPage';
import SprintDetailPage from './pages/project/SprintDetailPage';
import TasksPage from './pages/project/TasksPage';
import ArtifactsPage from './pages/project/ArtifactsPage';
import UtmPage from './pages/project/UtmPage';
import MarketingPage from './pages/project/MarketingPage';
import SeoPage from './pages/project/SeoPage';
import ClientsPage from './pages/project/ClientsPage';
import AnalyticsPage from './pages/project/AnalyticsPage';
import ChartsPage from './pages/project/ChartsPage';
import TeamPage from './pages/project/TeamPage';
import SkillsPage from './pages/project/SkillsPage';
import TagsPage from './pages/project/TagsPage';
import SettingsPage from './pages/project/SettingsPage';
import EpicsPage from './pages/project/EpicsPage';
export default function App() {
    return (
        <Routes>
            {/* ═══════════════ PUBLIC ═══════════════ */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
            </Route>

            {/* ═══════════════ AUTH ═══════════════ */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify" element={<VerifyPage />} />
            </Route>

            {/* ═══════════════ INVITE ═══════════════ */}
            <Route path="/invite/:token" element={<InviteAcceptPage />} />

            {/* ═══════════════ PROTECTED ═══════════════ */}
            <Route element={<ProtectedRoute />}>
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* ═══════════════ PROJECT INNER ═══════════════ */}
                <Route path="/projects/:projectId" element={<ProjectLayout />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="sprints" element={<SprintsPage />} />
                    <Route path="epics" element={<EpicsPage />} />
                    <Route path="sprints/:sprintId" element={<SprintDetailPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="artifacts" element={<ArtifactsPage />} />
                    <Route path="utm" element={<UtmPage />} />
                    <Route path="marketing" element={<MarketingPage />} />
                    <Route path="seo" element={<SeoPage />} />
                    <Route path="clients" element={<ClientsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="charts" element={<ChartsPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="skills" element={<SkillsPage />} />
                    <Route path="tags" element={<TagsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* ═══════════════ FALLBACK ═══════════════ */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}