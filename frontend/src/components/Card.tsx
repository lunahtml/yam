//frontend\src\components\Card.tsx
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
    icon?: ReactNode;
}

export default function Card({ children, title, icon }: CardProps) {
    return (
        <div
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 32,
                boxShadow: 'var(--shadow-lg)',
                maxWidth: 440,
                margin: '60px auto',
            }}
        >
            {title && (
                <div
                    style={{
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    {icon}
                    <h2
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}
                    >
                        {title}
                    </h2>
                </div>
            )}
            {children}
        </div>
    );
}