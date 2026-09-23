//frontend/src/pages/public/LandingPage.tsx
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div style={{ padding: 60, color: 'var(--text-primary)' }}>
            <h1>🪄 YAM. You Are Magic.</h1>
            <p>Лендинг — в разработке.</p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <Link to="/login">Войти</Link>
                <Link to="/register">Зарегистрироваться</Link>
            </div>
        </div>
    );
}