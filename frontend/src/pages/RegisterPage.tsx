//frontend\src\pages\RegisterPage.tsx
//frontend/src/pages/RegisterPage.tsx
import { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../api/client';

interface RegisterPageProps {
    onVerify: (verificationToken: string) => void;
    onSwitchToLogin: () => void;
}

export default function RegisterPage({
    onVerify,
    onSwitchToLogin,
}: RegisterPageProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError('');
        setLoading(true);

        try {
            const res = (await api.register(email, password, name || undefined)) as {
                verificationToken?: string;
                message?: string;
            };

            if (res.verificationToken) {
                localStorage.setItem('verificationToken', res.verificationToken);
                onVerify(res.verificationToken);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title="Регистрация в YAM"
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
                    <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                </div>
            }
        >
            <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
            />
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
            />
            <Input
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 12 символов"
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

            <Button onClick={handleRegister} loading={loading}>
                <UserPlus size={16} />
                Создать аккаунт
            </Button>

            <div
                style={{
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                }}
            >
                Уже есть аккаунт?{' '}
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onSwitchToLogin();
                    }}
                >
                    Войти
                </a>
            </div>
        </Card>
    );
}