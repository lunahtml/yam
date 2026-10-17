//frontend/src/layouts/ProjectLayout.tsx
import { useEffect, useState, useRef } from 'react';
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
    Layers,
    Bell,
    Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../api/client';
import { Notification } from '../types/api';
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
    { to: 'epics', label: 'Эпики', icon: Layers },
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

const NOTIFICATION_POLL_MS = 30000;

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [organizationId, setOrganizationId] = useState('');

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Polling непрочитанных
    useEffect(() => {
        let cancelled = false;

        const fetchCount = async () => {
            try {
                const res = await api.getUnreadNotificationsCount();
                if (!cancelled) setUnreadCount(res.count);
            } catch {
                // тихо
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, NOTIFICATION_POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    // Закрытие dropdown по клику вне
    useEffect(() => {
        if (!notificationsOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [notificationsOpen]);

    const handleToggleNotifications = async () => {
        const next = !notificationsOpen;
        setNotificationsOpen(next);
        if (next) {
            try {
                const data = await api.getNotifications();
                setNotifications(data);
            } catch {
                setNotifications([]);
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
            );
        } catch {
            // тихо
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.readAt) {
            try {
                await api.markNotificationRead(n.id);
                setUnreadCount((c) => Math.max(0, c - 1));
                setNotifications((prev) =>
                    prev.map((x) =>
                        x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x,
                    ),
                );
            } catch {
                // тихо
            }
        }
        // Переход
        if (n.sourceType === 'comment' && n.projectId) {
            // Пока ведём в задачи проекта (попап откроется, если задача есть в фильтре)
            navigate(`/projects/${n.projectId}/tasks`);
            setNotificationsOpen(false);
        }
    };

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

                    <div className="project-notifications" ref={dropdownRef}>
                        <button
                            className="project-notifications-btn"
                            onClick={handleToggleNotifications}
                            title="Уведомления"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="project-notifications-badge">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="project-notifications-dropdown">
                                <div className="project-notifications-head">
                                    <span>Уведомления</span>
                                    {unreadCount > 0 && (
                                        <button
                                            className="project-notifications-mark-all"
                                            onClick={handleMarkAllRead}
                                        >
                                            <Check size={12} />
                                            Прочитать все
                                        </button>
                                    )}
                                </div>

                                <div className="project-notifications-list">
                                    {notifications.length === 0 ? (
                                        <div className="project-notifications-empty">
                                            Пока нет уведомлений
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <button
                                                key={n.id}
                                                className={`project-notification-item ${!n.readAt ? 'project-notification-unread' : ''}`}
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                <div className="project-notification-title">
                                                    {n.title}
                                                </div>
                                                {n.body && (
                                                    <div className="project-notification-body">
                                                        {n.body}
                                                    </div>
                                                )}
                                                <div className="project-notification-date">
                                                    {new Date(n.createdAt).toLocaleString('ru-RU')}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
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