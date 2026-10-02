//frontend/src/pages/auth/DenyLoginPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import Card from '../../components/Card';
import Button from '../../components/Button';

type Status = 'loading' | 'success' | 'error';

export default function DenyLoginPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('Неверная ссылка');
            return;
        }

        api
            .denyLogin(token)
            .then(() => setStatus('success'))
            .catch((err: unknown) => {
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Ошибка');
            });
    }, [token]);

    return (
        <Card
            title={
                status === 'loading'
                    ? 'Обработка...'
                    : status === 'success'
                        ? 'Все сессии завершены'
                        : 'Ошибка'
            }
            icon={
                <div
                    style={{
                        width: 40,
                        height: 40,
                        background:
                            status === 'error'
                                ? 'var(--error)'
                                : 'linear-gradient(135deg, var(--accent), var(--cyan))',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {status === 'success' ? (
                        <CheckCircle size={20} color="#fff" />
                    ) : status === 'error' ? (
                        <XCircle size={20} color="#fff" />
                    ) : (
                        <Shield size={20} color="#fff" />
                    )}
                </div>
            }
        >
            {status === 'loading' && (
                <p>Завершаем все сессии...</p>
            )}

            {status === 'success' && (
                <>
                    <p>
                        Все активные сессии завершены. Если это были не вы —
                        рекомендуем сменить пароль.
                    </p>
                    <Button onClick={() => navigate('/login')}>
                        Войти заново
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                    <Button onClick={() => navigate('/')} variant="secondary">
                        На главную
                    </Button>
                </>
            )}
        </Card>
    );
}