//frontend/src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api/client';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const res = (await api.login(email, password)) as {
                requiresTwoFactor?: boolean;
                verificationToken?: string;
            };

            if (res.requiresTwoFactor && res.verificationToken) {
                localStorage.setItem('verificationToken', res.verificationToken);
                navigate('/verify?mode=login');
                return;
            }

            if (!res.requiresTwoFactor) {
                localStorage.setItem('isAuthenticated', '1');
                navigate('/projects');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title="Вход в YAM"
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
                placeholder="••••••••"
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

            <Button onClick={handleLogin} loading={loading}>
                <LogIn size={16} />
                Войти
            </Button>

            <div
                style={{
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                }}
            >
                Нет аккаунта?{' '}
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                    }}
                >
                    Зарегистрироваться
                </a>
            </div>
        </Card>
    );
}