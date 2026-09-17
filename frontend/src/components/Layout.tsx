//frontend\src\components\Layout.tsx
import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    activePage: string;
    onNavigate: (page: string) => void;
    children: ReactNode;
}

export default function Layout({
    activePage,
    onNavigate,
    children,
}: LayoutProps) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Sidebar active={activePage} onNavigate={onNavigate} />

            <main
                style={{
                    flex: 1,
                    padding: 40,
                    overflowY: 'auto',
                    maxHeight: '100vh',
                }}
            >
                {children}
            </main>
        </div>
    );
}