//frontend/src/pages/project/ChartsPage.tsx
import { LineChart } from 'lucide-react';
import './ChartsPage.css';

export default function ChartsPage() {
    return (
        <div className="charts-page">
            <h1 className="charts-title">
                <span className="charts-title-icon">
                    <LineChart size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Чарты
            </h1>

            <div className="charts-empty">
                <p>Графики и диаграммы — в разработке.</p>
                <p className="charts-hint">
                    Визуализация метрик: динамика, тренды, сравнения.
                </p>
            </div>
        </div>
    );
}