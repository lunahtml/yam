//frontend/src/pages/invite/InviteAcceptPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { Invitation } from '../../types/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import './InviteAcceptPage.css';

export default function InviteAcceptPage() {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const isAuthenticated = localStorage.getItem('isAuthenticated') === '1';

    useEffect(() => {
        if (!token) return;
        api
            .getInvitationByToken(token)
            .then(setInvitation)
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Invitation not found'),
            )
            .finally(() => setLoading(false));
    }, [token]);

    const handleAccept = async () => {
        if (!token) return;

        if (!isAuthenticated) {
            localStorage.setItem('pendingInviteToken', token);
            navigate('/login');
            return;
        }

        setAccepting(true);
        setError('');

        try {
            const result = await api.acceptInvitation(token);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/projects/${result.projectId}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="invite-page">
                <Card title="Загрузка...">
                    <div className="invite-loading">Проверяем приглашение...</div>
                </Card>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="invite-page">
                <Card
                    title="Приглашение не найдено"
                    icon={
                        <div className="invite-icon invite-icon-error">
                            <XCircle size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                    }
                >
                    <div className="invite-error">{error}</div>
                    <Button onClick={() => navigate('/')} variant="secondary">
                        Вернуться на главную
                    </Button>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="invite-page">
                <Card
                    title="Добро пожаловать!"
                    icon={
                        <div className="invite-icon invite-icon-success">
                            <CheckCircle size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                    }
                >
                    <div className="invite-success">
                        Вы добавлены в проект <strong>{invitation?.project?.name}</strong>
                    </div>
                    <div className="invite-redirect">Перенаправление...</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="invite-page">
            <Card
                title="Приглашение в проект"
                icon={
                    <div className="invite-icon">
                        <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                    </div>
                }
            >
                <div className="invite-info">
                    <div className="invite-row">
                        <span className="invite-label">Проект:</span>
                        <span className="invite-value">{invitation?.project?.name}</span>
                    </div>
                    <div className="invite-row">
                        <span className="invite-label">Приглашает:</span>
                        <span className="invite-value">
                            {invitation?.invitedBy?.name ?? invitation?.invitedBy?.email}
                        </span>
                    </div>
                    <div className="invite-row">
                        <span className="invite-label">Email:</span>
                        <span className="invite-value">{invitation?.email}</span>
                    </div>
                </div>

                {error && <div className="invite-error">{error}</div>}

                {!isAuthenticated && (
                    <div className="invite-warning">
                        <Mail size={14} />
                        Войдите или зарегистрируйтесь под email{' '}
                        <strong>{invitation?.email}</strong>, чтобы принять приглашение.
                    </div>
                )}

                <Button onClick={handleAccept} loading={accepting}>
                    {isAuthenticated ? 'Принять приглашение' : 'Войти и принять'}
                </Button>
            </Card>
        </div>
    );
}