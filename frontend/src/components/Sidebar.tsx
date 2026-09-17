//frontend\src\components\Sidebar.tsx
import {
    FolderKanban,
    Link2,
    Users,
    UserCog,
    Megaphone,
    Search,
    Link,
    BarChart3,
    LineChart,
    LogOut,
    Sparkles,
    LucideIcon,
} from 'lucide-react';

interface SidebarProps {
    active: string;
    onNavigate: (page: string) => void;
}

interface MenuItem {
    key: string;
    label: string;
    icon: LucideIcon;
}

const MENU: MenuItem[] = [
    { key: 'projects', label: 'Проекты', icon: FolderKanban },
    { key: 'artifacts', label: 'Артефакты', icon: Link2 },
    { key: 'clients', label: 'Клиенты', icon: Users },
    { key: 'team', label: 'Команда', icon: UserCog },
    { key: 'marketing', label: 'Маркетинг', icon: Megaphone },
    { key: 'seo', label: 'SEO', icon: Search },
    { key: 'utm', label: 'UTM-метки', icon: Link },
    { key: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { key: 'charts', label: 'Чарты', icon: LineChart },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
    return (
        <aside
            style={{
                width: 240,
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                minHeight: '100vh',
                padding: '20px 0',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Лого */}
            <div
                style={{
                    padding: '0 20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 16,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px var(--accent-glow)',
                    }}
                >
                    <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}
                    >
                        YAM
                    </div>
                    <div
                        style={{
                            fontSize: 10,
                            color: 'var(--text-muted)',
                            letterSpacing: 1,
                        }}
                    >
                        YOU ARE MAGIC
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 8px' }}>
                {MENU.map((item) => {
                    const isActive = active === item.key;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                width: '100%',
                                padding: '10px 12px',
                                background: isActive
                                    ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.15), rgba(34, 211, 238, 0.08))'
                                    : 'transparent',
                                border: 'none',
                                borderLeft: isActive
                                    ? '3px solid var(--accent)'
                                    : '3px solid transparent',
                                color: isActive
                                    ? 'var(--text-primary)'
                                    : 'var(--text-secondary)',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                                borderRadius: '0 8px 8px 0',
                                marginBottom: 2,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div
                style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                }}
            >
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'transparent',
                        border: '1px solid var(--border-bright)',
                        borderRadius: 8,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--error)';
                        e.currentTarget.style.color = 'var(--error)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <LogOut size={16} />
                    Выйти
                </button>
            </div>
        </aside>
    );
}