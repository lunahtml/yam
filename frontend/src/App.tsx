//frontend/src/App.tsx
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import MainPage from './pages/MainPage';
import ProjectLayout from './pages/project/ProjectLayout';
import ProfilePage from './pages/ProfilePage';
import InviteAcceptPage from './pages/InviteAcceptPage';
type Screen =
    | { name: 'login' }
    | { name: 'register' }
    | { name: 'verify'; token: string; mode: 'email' | 'login' }
    | { name: 'main' }
    | { name: 'project'; projectId: string; projectName: string }
    | { name: 'profile' }
    | { name: 'invite'; token: string };

export default function App() {
    // const [screen, setScreen] = useState<Screen>({ name: 'login' });
    const [screen, setScreen] = useState<Screen>(() => {
        // Проверяем URL на /invite/:token
        const match = window.location.pathname.match(/^\/invite\/([a-f0-9]+)$/);
        if (match) {
            return { name: 'invite', token: match[1] };
        }

        const isAuth = localStorage.getItem('isAuthenticated') === '1';
        return isAuth ? { name: 'main' } : { name: 'login' };
    });
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            {screen.name === 'login' && (
                <LoginPage
                    onVerify={(token) =>
                        setScreen({ name: 'verify', token, mode: 'login' })
                    }
                    onSuccess={() => {
                        localStorage.setItem('isAuthenticated', '1');
                        setScreen({ name: 'main' });
                    }}
                    onSwitchToRegister={() => setScreen({ name: 'register' })}
                />
            )}

            {screen.name === 'register' && (
                <RegisterPage
                    onVerify={(token) =>
                        setScreen({ name: 'verify', token, mode: 'email' })
                    }
                    onSwitchToLogin={() => setScreen({ name: 'login' })}
                />
            )}

            {screen.name === 'verify' && (
                <VerifyPage
                    verificationToken={screen.token}
                    mode={screen.mode}
                    onSuccess={() => {
                        localStorage.setItem('isAuthenticated', '1');
                        setScreen({ name: 'main' });
                    }}
                />
            )}
            {screen.name === 'profile' && (
                <ProfilePage onBack={() => setScreen({ name: 'main' })} />
            )}
            {screen.name === 'main' && (
                <MainPage
                    onOpenProject={(projectId, projectName) => {
                        if (!projectId) return;
                        setScreen({ name: 'project', projectId, projectName });
                    }}
                    onOpenProfile={() => setScreen({ name: 'profile' })}
                    onLogout={() => {
                        localStorage.clear();
                        setScreen({ name: 'login' });
                    }}
                />
            )}

            {screen.name === 'project' && (
                <ProjectLayout
                    projectId={screen.projectId}
                    projectName={screen.projectName}
                    onBack={() => setScreen({ name: 'main' })}
                />
            )}
            {screen.name === 'invite' && (
                <InviteAcceptPage
                    token={screen.token}
                    onGoToLogin={() => setScreen({ name: 'login' })}
                    onGoToProject={(projectId) => {
                        window.history.replaceState({}, '', '/');
                        setScreen({ name: 'project', projectId, projectName: '' });
                    }}
                />
            )}
        </div>
    );
}