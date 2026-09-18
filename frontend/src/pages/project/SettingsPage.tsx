//frontend/src/pages/project/SettingsPage.tsx
import { Settings } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
    return (
        <div className="settings-page">
            <h1 className="settings-title">
                <span className="settings-title-icon">
                    <Settings size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Настройки проекта
            </h1>

            <div className="settings-empty">
                <p>Настройки проекта — в разработке.</p>
                <p className="settings-hint">
                    Здесь будут: название, описание, роли команды, интеграции, вебхуки.
                </p>
            </div>
        </div>
    );
}