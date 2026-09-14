//frontend\src\App.tsx
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';

type Screen =
    | { name: 'login' }
    | { name: 'register' }
    | { name: 'verify'; token: string; mode: 'email' | 'login' }
    | { name: 'dashboard' };

export default function App() {
    const [screen, setScreen] = useState<Screen>({ name: 'login' });

    return (
        <>
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
        </>
    );
}