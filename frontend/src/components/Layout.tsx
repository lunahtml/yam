//frontend\src\components\Layout.tsx
import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    activePage: string;
    onNavigate: (page: string) => void;
    children: ReactNode;
}

export default function Layout({ activePage, onNavigate, children }: LayoutProps) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar active={activePage} onNavigate={onNavigate} />

            <main
                style={{
                    flex: 1,
                    padding: 40,
                    background: '#f5f7fa',
                    overflowY: 'auto',
                }}
            >
                {children}
            </main>
        </div>
    );
}