//frontend\src\components\Card.tsx
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
}

export default function Card({ children, title }: CardProps) {
    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 12,
                padding: 32,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                maxWidth: 420,
                margin: '60px auto',
            }}
        >
            {title && (
                <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700 }}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}