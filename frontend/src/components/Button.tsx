//frontend\src\components\Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
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
        fontSize: 14,
        fontWeight: 600,
        border: 'none',
        borderRadius: 10,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled || loading ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: 0.2,
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
            color: '#0a0612',
            boxShadow: '0 4px 20px var(--accent-glow)',
        },
        secondary: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-bright)',
        },
        danger: {
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
        },
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            style={{ ...base, ...variants[variant], ...style }}
            onMouseEnter={(e) => {
                if (disabled || loading) return;
                if (variant === 'primary') {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-glow)';
                } else {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                }
            }}
            onMouseLeave={(e) => {
                if (disabled || loading) return;
                if (variant === 'primary') {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-glow)';
                } else {
                    e.currentTarget.style.background = variants[variant].background as string;
                }
            }}
        >
            {loading ? '...' : children}
        </button>
    );
}