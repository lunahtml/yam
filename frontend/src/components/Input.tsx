//frontend\src\components\Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, style, ...props }, ref) => {
        return (
            <div style={{ marginBottom: 16 }}>
                {label && (
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 6,
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                            letterSpacing: 0.2,
                        }}
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    {...props}
                    style={{
                        width: '100%',
                        padding: '11px 14px',
                        fontSize: 14,
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s',
                        ...style,
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                />
            </div>
        );
    },
);

Input.displayName = 'Input';
export default Input;