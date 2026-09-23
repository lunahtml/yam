//frontend/src/pages/projects/SkillDetailPopup.tsx
import { useEffect, useState } from 'react';
import {
    X,
    TrendingUp,
    Award,
    GraduationCap,
    Rocket,
    HelpCircle,
    Sparkles,
    User as UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { UserSkill, EvidenceType } from '../../types/api';
import './SkillDetailPopup.css';

interface SkillDetailPopupProps {
    userSkillId: string;
    onClose: () => void;
}

const EVIDENCE_META: Record<
    EvidenceType,
    { label: string; icon: LucideIcon; color: string }
> = {
    TASK_COMPLETED: {
        label: 'Закрытая задача',
        icon: TrendingUp,
        color: 'evidence-task',
    },
    INTERNAL_EXAM: {
        label: 'Внутренний экзамен',
        icon: Award,
        color: 'evidence-exam',
    },
    EXTERNAL_EDUCATION: {
        label: 'Внешнее обучение',
        icon: GraduationCap,
        color: 'evidence-education',
    },
    IMPLEMENTATION: {
        label: 'Внедрение',
        icon: Rocket,
        color: 'evidence-implementation',
    },
    HELPED_COLLEAGUE: {
        label: 'Помощь коллеге',
        icon: Sparkles,
        color: 'evidence-help',
    },
    MANUAL_GRANT: {
        label: 'Ручной подъём',
        icon: Award,
        color: 'evidence-manual',
    },
    FACILITATION: {
        label: 'Фасилитация',
        icon: HelpCircle,
        color: 'evidence-facilitation',
    },
};

export default function SkillDetailPopup({
    userSkillId,
    onClose,
}: SkillDetailPopupProps) {
    const [userSkill, setUserSkill] = useState<UserSkill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getUserSkill(userSkillId);
            setUserSkill(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [userSkillId]);

    return (
        <div className="skill-detail-overlay" onClick={onClose}>
            <div className="skill-detail" onClick={(e) => e.stopPropagation()}>
                <div className="skill-detail-header">
                    <h3 className="skill-detail-title">История навыка</h3>
                    <button className="skill-detail-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {error && <div className="skill-detail-error">{error}</div>}

                {loading ? (
                    <div className="skill-detail-loading">Загрузка...</div>
                ) : !userSkill ? (
                    <div className="skill-detail-empty">Нет данных</div>
                ) : (
                    <>
                        <div className="skill-detail-info">
                            <div className="skill-detail-name">
                                {userSkill.skill?.label ?? 'Навык'}
                            </div>
                            <div className="skill-detail-level">
                                <span className="skill-detail-level-label">
                                    {userSkill.levelLabel}
                                </span>
                                <span className="skill-detail-level-value">
                                    {userSkill.level}/10
                                </span>
                            </div>
                        </div>

                        <div className="skill-detail-bar">
                            <div
                                className="skill-detail-bar-fill"
                                style={{ width: `${userSkill.level * 10}%` }}
                            />
                        </div>

                        <div className="skill-detail-stats">
                            <div className="skill-detail-stat">
                                <div className="skill-detail-stat-value">
                                    {userSkill.practiceCount}
                                </div>
                                <div className="skill-detail-stat-label">Практика</div>
                            </div>
                            <div className="skill-detail-stat">
                                <div className="skill-detail-stat-value">
                                    {userSkill.evidenceCount}
                                </div>
                                <div className="skill-detail-stat-label">Доказательств</div>
                            </div>
                            {userSkill.lastUsedAt && (
                                <div className="skill-detail-stat">
                                    <div className="skill-detail-stat-value">
                                        {new Date(userSkill.lastUsedAt).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div className="skill-detail-stat-label">Последний раз</div>
                                </div>
                            )}
                        </div>

                        {userSkill.context && (
                            <div className="skill-detail-context">
                                Контекст: <strong>{userSkill.context.name}</strong>
                            </div>
                        )}

                        <h4 className="skill-detail-subtitle">
                            История роста ({userSkill.evidences?.length ?? 0})
                        </h4>

                        {!userSkill.evidences || userSkill.evidences.length === 0 ? (
                            <div className="skill-detail-empty">
                                Пока нет записей
                            </div>
                        ) : (
                            <div className="skill-detail-evidences">
                                {userSkill.evidences.map((ev) => {
                                    const meta = EVIDENCE_META[ev.type];
                                    const Icon = meta.icon;
                                    return (
                                        <div
                                            key={ev.id}
                                            className={`skill-evidence ${meta.color}`}
                                        >
                                            <div className="skill-evidence-icon">
                                                <Icon size={14} />
                                            </div>

                                            <div className="skill-evidence-content">
                                                <div className="skill-evidence-type">{meta.label}</div>
                                                {ev.comment && (
                                                    <div className="skill-evidence-comment">
                                                        {ev.comment}
                                                    </div>
                                                )}
                                                <div className="skill-evidence-meta">
                                                    +{ev.weight} · {new Date(ev.createdAt).toLocaleString('ru-RU')}
                                                    {ev.createdBy && (
                                                        <>
                                                            {' · '}
                                                            <UserIcon
                                                                size={10}
                                                                style={{
                                                                    display: 'inline',
                                                                    verticalAlign: 'middle',
                                                                }}
                                                            />
                                                            {ev.createdBy.name ?? ev.createdBy.email}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}