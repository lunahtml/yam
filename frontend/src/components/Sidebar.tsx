//frontend\src\components\Sidebar.tsx
interface SidebarProps {
    active: string;
    onNavigate: (page: string) => void;
}

interface MenuItem {
    key: string;
    label: string;
    icon: string;
}

const MENU: MenuItem[] = [
    { key: 'projects', label: 'Проекты', icon: '📁' },
    { key: 'clients', label: 'Клиенты', icon: '👥' },
    { key: 'team', label: 'Команда', icon: '🧑‍💻' },
    { key: 'marketing', label: 'Маркетинг', icon: '📣' },
    { key: 'seo', label: 'SEO', icon: '🔎' },
    { key: 'utm', label: 'UTM-метки', icon: '🔗' },
    { key: 'analytics', label: 'Аналитика', icon: '📊' },
    { key: 'charts', label: 'Чарты', icon: '📈' },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
    return (
        <aside
            style={{
                width: 240,
                background: '#1a202c',
                color: '#fff',
                minHeight: '100vh',
                padding: '20px 0',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ padding: '0 20px 24px', fontSize: 18, fontWeight: 700 }}>
                🪄 YAM
            </div>

            <nav style={{ flex: 1 }}>
                {MENU.map((item) => {
                    const isActive = active === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                width: '100%',
                                padding: '12px 20px',
                                background: isActive ? '#2d3748' : 'transparent',
                                border: 'none',
                                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                                color: isActive ? '#fff' : '#cbd5e0',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #2d3748' }}>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'transparent',
                        border: '1px solid #4a5568',
                        borderRadius: 6,
                        color: '#cbd5e0',
                        cursor: 'pointer',
                        fontSize: 13,
                    }}
                >
                    Выйти
                </button>
            </div>
        </aside>
    );
}