//frontend/src/features/team/UserProfileModal.tsx
import { useEffect, useState } from 'react';
import { X, User as UserIcon, Mail, Sparkles, Trophy, Award, TrendingUp, Zap } from 'lucide-react';
import { api } from '../../api/client';
import { UserSkill, UserAchievement, Category } from '../../types/api';
import XMatrix from '../skills/XMatrix';
import RankBadge from '../gamification/RankBadge';
import './UserProfileModal.css';

interface UserProfileModalProps {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string | null;
    onClose: () => void;
    onGrant: () => void;
}

const XP_SOURCE_LABELS: Record<string, string> = {
    SPRINT_EVENT: 'События спринта',
    INCREMENT: 'Инкременты',
    METRIC_ACHIEVED: 'Метрики',
    GOAL_ACHIEVED: 'Цели',
    TASK_COMPLETED: 'Задачи',
    MANUAL_GRANT: 'Ручное',
};

export default function UserProfileModal({
    userId,
    userName,
    userEmail,
    userAvatar,
    onClose,
    onGrant,
}: UserProfileModalProps) {
    const [skills, setSkills] = useState<UserSkill[]>([]);
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [spheres, setSpheres] = useState<Category[]>([]);
    const [geographies, setGeographies] = useState<Category[]>([]);
    const [xp, setXp] = useState<{ total: number; bySource: { source: string; total: number }[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getUserSkills(userId),
            api.getUserAchievements(userId),
            api.getUserXp(userId),
        ])
            .then(([skillsData, achData, xpData]) => {
                setSkills(skillsData);
                setAchievements(achData);
                setXp(xpData);
            })
            .catch(() => { })
            .finally(() => setLoading(false));

        api.getMyOrganizations().then(async (orgs) => {
            if (orgs.length > 0) {
                const orgId = orgs[0].id;
                const [s, g] = await Promise.all([
                    api.getCategories(orgId, 'SPHERE'),
                    api.getCategories(orgId, 'GEOGRAPHY'),
                ]);
                setSpheres(s);
                setGeographies(g);
            }
        });
    }, [userId]);

    return (
        <div className="user-profile-overlay" onClick={onClose}>
            <div className="user-profile" onClick={(e) => e.stopPropagation()}>
                <div className="user-profile-header">
                    <div className="user-profile-avatar">
                        {userAvatar ? (
                            <img src={userAvatar} alt="" />
                        ) : (
                            <span>{getInitials(userName || userEmail)}</span>
                        )}
                    </div>
                    <div className="user-profile-info">
                        <h2 className="user-profile-name">{userName || userEmail}</h2>
                        {userName && (
                            <div className="user-profile-email">
                                <Mail size={13} />
                                {userEmail}
                            </div>
                        )}
                    </div>
                    <button className="user-profile-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="user-profile-body">
                    {loading ? (
                        <div className="user-profile-loading">Загрузка...</div>
                    ) : (
                        <>
                            {xp && xp.total > 0 && (
                                <div className="user-profile-section">
                                    <h3 className="user-profile-section-title">
                                        <Trophy size={16} />
                                        Опыт
                                    </h3>
                                    <RankBadge totalXp={xp.total} size="compact" />

                                    <div className="user-profile-xp">
                                        <span className="user-profile-xp-value">{xp.total}</span>
                                        <span className="user-profile-xp-label">XP</span>
                                    </div>
                                    {xp.bySource.length > 0 && (
                                        <div className="user-profile-xp-sources">
                                            {xp.bySource.map((s) => (
                                                <div key={s.source} className="user-profile-xp-source">
                                                    <span>{XP_SOURCE_LABELS[s.source] ?? s.source}</span>
                                                    <span>+{s.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {achievements.length > 0 && (
                                <div className="user-profile-section">
                                    <h3 className="user-profile-section-title">
                                        <Award size={16} />
                                        Ачивки ({achievements.length})
                                    </h3>
                                    <div className="user-profile-achievements">
                                        {achievements.map((ua) => (
                                            <div key={ua.id} className="user-profile-achievement">
                                                <div className="user-profile-achievement-icon">
                                                    {ua.achievement.icon ?? '🏆'}
                                                </div>
                                                <div className="user-profile-achievement-content">
                                                    <div className="user-profile-achievement-label">
                                                        {ua.achievement.label}
                                                    </div>
                                                    <div className="user-profile-achievement-meta">
                                                        {new Date(ua.grantedAt).toLocaleDateString('ru-RU')}
                                                        {ua.grantedBy && (
                                                            <> · от {ua.grantedBy.name ?? ua.grantedBy.email}</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skills.length > 0 && (
                                <div className="user-profile-section">
                                    <h3 className="user-profile-section-title">
                                        <Sparkles size={16} />
                                        Навыки ({skills.length})
                                    </h3>
                                    <div className="user-profile-skills">
                                        {skills.map((us) => (
                                            <div key={us.id} className="user-profile-skill">
                                                <div className="user-profile-skill-header">
                                                    <span className="user-profile-skill-name">
                                                        {us.skill?.label ?? 'Навык'}
                                                    </span>
                                                    <span className="user-profile-skill-level">
                                                        {us.levelLabel} · {us.level}/10
                                                    </span>
                                                </div>
                                                <div className="user-profile-skill-bar">
                                                    <div
                                                        className="user-profile-skill-bar-fill"
                                                        style={{ width: `${us.level * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skills.length > 0 && (
                                <div className="user-profile-section">
                                    <XMatrix
                                        userSkills={skills}
                                        spheres={spheres}
                                        geographies={geographies}
                                        title="X-Matrix компетенций"
                                    />
                                </div>
                            )}

                            {!xp?.total && achievements.length === 0 && skills.length === 0 && (
                                <div className="user-profile-empty">
                                    Пока нет данных о пользователе.
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="user-profile-footer">
                    <button className="user-profile-grant-btn" onClick={onGrant}>
                        <Award size={16} />
                        Наградить ачивкой
                    </button>
                </div>
            </div>
        </div>
    );
}

function getInitials(str: string): string {
    const parts = str.split(/[\s@.]+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}