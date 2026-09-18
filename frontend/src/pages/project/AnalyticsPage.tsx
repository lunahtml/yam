//frontend/src/pages/project/AnalyticsPage.tsx
import { BarChart3 } from 'lucide-react';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
    return (
        <div className="analytics-page">
            <h1 className="analytics-title">
                <span className="analytics-title-icon">
                    <BarChart3 size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Аналитика
            </h1>

            <div className="analytics-empty">
                <p>Аналитика — в разработке.</p>
                <p className="analytics-hint">
                    Трафик, конверсии, воронки, когорты, retention.
                </p>
            </div>
        </div>
    );
}