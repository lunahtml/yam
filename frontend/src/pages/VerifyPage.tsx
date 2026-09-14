//frontend\src\pages\VerifyPage.tsx
import { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../api/client';

interface VerifyPageProps {
    verificationToken: string;
    mode: 'email' | 'login';
    onSuccess: () => void;
}

export default function VerifyPage({
    verificationToken,
    mode,
    onSuccess,
}: VerifyPageProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setError('');
        setLoading(true);

        try {
            if (mode === 'email') {
                await api.verifyEmail(verificationToken, code);
                onSuccess();
                return;
            }

            const res = await api.verifyLogin(verificationToken, code) as {
                accessToken?: string;
                refreshToken?: string;
            };

            if (res.accessToken) {
                localStorage.setItem('accessToken', res.accessToken);
                if (res.refreshToken) {
                    localStorage.setItem('refreshToken', res.refreshToken);
                }
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Введите код">
            <p style={{ marginBottom: 20, color: '#718096', fontSize: 14 }}>
                {mode === 'email'
                    ? 'Мы отправили код подтверждения на ваш email.'
                    : 'Обнаружен новый вход. Если это вы — введите код из письма.'}
            </p>

            <Input
                label="Код из письма"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
            />

            {error && (
                <div style={{ color: '#e53e3e', marginBottom: 16, fontSize: 14 }}>
                    {error}
                </div>
            )}

            <Button onClick={handleVerify} loading={loading}>
                Подтвердить
            </Button>
        </Card>
    );
}