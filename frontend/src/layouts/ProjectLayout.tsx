//frontend\src\layouts\ProjectLayout.tsx
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
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
    Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../api/client';
import './ProjectLayout.css';

export interface ProjectContext {
    projectId: string;
    projectName: string;
    organizationId: string;
}

interface MenuItem {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
}

const MENU: MenuItem[] = [
    { to: '', label: 'Обзор', icon: LayoutDashboard, end: true },
    { to: 'sprints', label: 'Спринты', icon: Rocket },
    { to: 'tasks', label: 'Задачи', icon: ListTodo },
    { to: 'artifacts', label: 'Артефакты', icon: Link2 },
    { to: 'utm', label: 'UTM-метки', icon: Target },
    { to: 'marketing', label: 'Маркетинг', icon: Megaphone },
    { to: 'seo', label: 'SEO', icon: Search },
    { to: 'skills', label: 'Навыки', icon: Sparkles },
    { to: 'tags', label: 'Теги', icon: Tag },
    { to: 'clients', label: 'Клиенты', icon: Users },
    { to: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { to: 'charts', label: 'Чарты', icon: LineChart },
    { to: 'team', label: 'Команда', icon: UserCog },
    { to: 'settings', label: 'Настройки', icon: Settings },
];

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [organizationId, setOrganizationId] = useState('');

    useEffect(() => {
        if (!projectId) return;
        api
            .getProject(projectId)
            .then(async (project) => {
                setProjectName(project.name);
                if (project.workspaceId) {
                    const workspace = await api.getWorkspace(project.workspaceId);
                    if (workspace?.organizationId) {
                        setOrganizationId(workspace.organizationId);
                    }
                }
            })
            .catch(() => { });
    }, [projectId]);

    if (!projectId) return null;

    const context: ProjectContext = { projectId, projectName, organizationId };

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
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `project-sidebar-item ${isActive ? 'project-sidebar-item-active' : ''}`
                                }
                            >
                                <Icon size={18} strokeWidth={2} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="project-sidebar-footer">
                    <button
                        className="project-sidebar-back"
                        onClick={() => navigate('/projects')}
                    >
                        <ArrowLeft size={16} />
                        Все проекты
                    </button>
                </div>
            </aside>

            <main className="project-main">
                <Outlet context={context} />
            </main>
        </div>
    );
}