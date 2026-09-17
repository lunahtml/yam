//frontend/src/App.tsx
import { useState, useEffect } from 'react';  // ДОБАВЛЕНО: useEffect
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import { api } from './api/client';  // ДОБАВЛЕНО

type Screen =
    | { name: 'login' }
    | { name: 'register' }
    | { name: 'verify'; token: string; mode: 'email' | 'login' }
    | { name: 'dashboard' };

export default function App() {
    const [screen, setScreen] = useState<Screen>({ name: 'login' });
    const [checkingSession, setCheckingSession] = useState(true); // ДОБАВЛЕНО

    // ДОБАВЛЕНО: при монтировании приложения проверяем, есть ли уже
    // действующая сессия (через httpOnly cookie), прежде чем показывать LoginPage.
    // ПОЧЕМУ: раньше состояние логина нигде не персистилось на фронте явно,
    // теперь тем более — токены лежат в httpOnly cookie, недоступной для JS,
    // так что единственный способ узнать "залогинен ли я" — спросить бэкенд.
    useEffect(() => {
        // ДОБАВЛЕНО: сначала проверяем сессию напрямую; если access-токен уже протух,
        // пробуем обновить его через refresh перед тем как сдаться и показать логин
        api.getMySessions()
            .then(() => setScreen({ name: 'dashboard' }))
            .catch(() =>
                api.refresh()
                    .then(() => setScreen({ name: 'dashboard' }))
                    .catch(() => setScreen({ name: 'login' })),
            )
            .finally(() => setCheckingSession(false));
    }, []);

    if (checkingSession) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
                {/* можно заменить на реальный спиннер/скелетон */}
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            {screen.name === 'login' && (
                <LoginPage
                    onVerify={(token) => setScreen({ name: 'verify', token, mode: 'login' })}
                    onSuccess={() => setScreen({ name: 'dashboard' })}
                    onSwitchToRegister={() => setScreen({ name: 'register' })}
                />
            )}

            {screen.name === 'register' && (
                <RegisterPage
                    onVerify={(token) => setScreen({ name: 'verify', token, mode: 'email' })}
                    onSwitchToLogin={() => setScreen({ name: 'login' })}
                />
            )}

            {screen.name === 'verify' && (
                <VerifyPage
                    verificationToken={screen.token}
                    mode={screen.mode}
                    onSuccess={() => setScreen({ name: 'dashboard' })}
                />
            )}

            {screen.name === 'dashboard' && <DashboardPage />}
        </div>
    );
}