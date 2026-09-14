//frontend\src\components\Input.tsx
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export default function Input({ label, style, ...props }: InputProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: 6,
                        fontSize: 14,
                        color: '#4a5568',
                        fontWeight: 500,
                    }}
                >
                    {label}
                </label>
            )}
            <input
                {...props}
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 15,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#fff',
                    transition: 'border-color 0.2s',
                    ...style,
                }}
            />
        </div>
    );
}