//frontend/src/pages/auth/VerifyPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/client';

export default function VerifyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = (searchParams.get('mode') === 'login' ? 'login' : 'email') as
        | 'email'
        | 'login';
    const verificationToken = localStorage.getItem('verificationToken') ?? '';

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectAfterAuth = () => {
        const pendingInvite = localStorage.getItem('pendingInviteToken');
        if (pendingInvite) {
            localStorage.removeItem('pendingInviteToken');
            navigate(`/invite/${pendingInvite}`);
        } else {
            navigate('/projects');
        }
    };

    const handleVerify = async () => {
        setError('');
        setLoading(true);

        try {
            if (mode === 'email') {
                await api.verifyEmail(verificationToken, code);
                localStorage.removeItem('verificationToken');
                localStorage.setItem('isAuthenticated', '1');
                redirectAfterAuth();
                return;
            }

            await api.verifyLogin(verificationToken, code);
            localStorage.removeItem('verificationToken');
            localStorage.setItem('isAuthenticated', '1');
            redirectAfterAuth();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title="Введите код"
            icon={
                <div
                    style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px var(--accent-glow)',
                    }}
                >
                    <Shield size={20} color="#fff" strokeWidth={2.5} />
                </div>
            }
        >
            <p
                style={{
                    marginBottom: 20,
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    lineHeight: 1.5,
                }}
            >
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
                style={{
                    fontSize: 24,
                    letterSpacing: 8,
                    textAlign: 'center',
                    fontWeight: 700,
                }}
            />

            {error && (
                <div
                    style={{
                        color: 'var(--error)',
                        marginBottom: 16,
                        fontSize: 13,
                        padding: 10,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                    }}
                >
                    {error}
                </div>
            )}

            <Button onClick={handleVerify} loading={loading}>
                <Check size={16} />
                Подтвердить
            </Button>
        </Card>
    );
}