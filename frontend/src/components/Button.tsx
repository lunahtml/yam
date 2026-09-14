//frontend\src\components\Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    loading,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const base: React.CSSProperties = {
        width: '100%',
        padding: '12px 20px',
        fontSize: 15,
        fontWeight: 600,
        border: 'none',
        borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled || loading ? 0.6 : 1,
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: '#6366f1',
            color: '#fff',
        },
        secondary: {
            background: '#e2e8f0',
            color: '#1a202c',
        },
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            style={{ ...base, ...variants[variant], ...style }}
        >
            {loading ? '...' : children}
        </button>
    );
}