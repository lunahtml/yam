//frontend/src/pages/project/OverviewPage.tsx
import { useEffect, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { api } from '../../api/client';
import { Entity } from '../../types/api';
import './OverviewPage.css';

interface OverviewPageProps {
    projectId: string;
    projectName: string;
}

export default function OverviewPage({
    projectId,
    projectName,
}: OverviewPageProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .getEntities(projectId)
            .then(setEntities)
            .finally(() => setLoading(false));
    }, [projectId]);

    const totalRecords = entities.reduce(
        (sum, e) => sum + (e._count?.records ?? 0),
        0,
    );

    return (
        <div className="overview-page">
            <h1 className="overview-title">
                <span className="overview-title-icon">
                    <LayoutDashboard size={22} color="#fff" strokeWidth={2.5} />
                </span>
                {projectName}
            </h1>

            <div className="overview-stats">
                <div className="overview-stat">
                    <div className="overview-stat-value">
                        {loading ? '...' : entities.length}
                    </div>
                    <div className="overview-stat-label">Сущностей</div>
                </div>

                <div className="overview-stat">
                    <div className="overview-stat-value">
                        {loading ? '...' : totalRecords}
                    </div>
                    <div className="overview-stat-label">Записей</div>
                </div>

                <div className="overview-stat">
                    <div className="overview-stat-value">0</div>
                    <div className="overview-stat-label">Спринтов</div>
                </div>

                <div className="overview-stat">
                    <div className="overview-stat-value">0</div>
                    <div className="overview-stat-label">Инкрементов</div>
                </div>
            </div>

            <div className="overview-section">
                <h2 className="overview-section-title">Сущности проекта</h2>

                {loading ? (
                    <div className="overview-loading">Загрузка...</div>
                ) : entities.length === 0 ? (
                    <div className="overview-empty">
                        Нет сущностей. Перейди в раздел «Задачи» и создай шаблон.
                    </div>
                ) : (
                    <div className="overview-entities">
                        {entities.map((e) => (
                            <div key={e.id} className="overview-entity">
                                <div className="overview-entity-label">{e.label}</div>
                                <div className="overview-entity-name">{e.name}</div>
                                <div className="overview-entity-count">
                                    {e._count?.records ?? 0} записей
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}