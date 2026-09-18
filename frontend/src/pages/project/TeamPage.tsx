//frontend/src/pages/project/TeamPage.tsx
import { UserCog } from 'lucide-react';
import './TeamPage.css';

export default function TeamPage() {
    return (
        <div className="team-page">
            <h1 className="team-title">
                <span className="team-title-icon">
                    <UserCog size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Команда
            </h1>

            <div className="team-empty">
                <p>Команда проекта — в разработке.</p>
                <p className="team-hint">
                    Участники, роли, X-Matrix компетенций, нагрузка, рост.
                </p>
            </div>
        </div>
    );
}