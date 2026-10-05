//frontend/src/pages/projects/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Mail,
    Sparkles,
    TrendingUp,
    Trophy,
    Award,
} from 'lucide-react';
import { UserSkill, User, Category, UserAchievement } from '../../types/api';
import { api } from '../../api/client';
import Input from '../../components/Input';
import SkillDetailPopup from './SkillDetailPopup';
import XMatrix from '../../features/skills/XMatrix';
import RankBadge from '../../features/gamification/RankBadge';
import InfoPopup from '../../components/InfoPopup';
import Button from '../../components/Button';
import './ProfilePage.css';

const XP_SOURCE_LABELS: Record<string, string> = {
    SPRINT_EVENT: 'События спринта',
    INCREMENT: 'Инкременты',
    METRIC_ACHIEVED: 'Достигнутые метрики',
    GOAL_ACHIEVED: 'Достигнутые цели',
    TASK_COMPLETED: 'Закрытые задачи',
    MANUAL_GRANT: 'Ручное начисление',
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [skills, setSkills] = useState<UserSkill[]>([]);
    const [spheres, setSpheres] = useState<Category[]>([]);
    const [geographies, setGeographies] = useState<Category[]>([]);
    const [openedSkillId, setOpenedSkillId] = useState<string | null>(null);
    const [skillsLoading, setSkillsLoading] = useState(true);
    const [xp, setXp] = useState<{
        total: number;
        bySource: { source: string; total: number }[];
        history: {
            id: string;
            amount: number;
            source: string;
            note: string | null;
            createdAt: string;
        }[];
    } | null>(null);
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);

    useEffect(() => {
        api
            .getMe()
            .then(async (u) => {
                setUser(u);
                setName(u.name ?? '');
                setAvatarUrl(u.avatarUrl ?? '');

                try {
                    const skillsData = await api.getUserSkills(u.id);
                    setSkills(skillsData);

                    api
                        .getMyXp()
                        .then((xpData) => setXp(xpData))
                        .catch(() => { });

                    api
                        .getUserAchievements(u.id)
                        .then((achData) => setAchievements(achData))
                        .catch(() => { });

                    const orgs = await api.getMyOrganizations();
                    if (orgs.length > 0) {
                        const orgId = orgs[0].id;
                        const [spheresData, geosData] = await Promise.all([
                            api.getCategories(orgId, 'SPHERE'),
                            api.getCategories(orgId, 'GEOGRAPHY'),
                        ]);
                        setSpheres(spheresData);
                        setGeographies(geosData);
                    }
                } catch {
                    // ignore
                } finally {
                    setSkillsLoading(false);
                }
            })
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'Failed to load'),
            )
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const updated = await api.updateMe({
                name: name.trim() || undefined,
                avatarUrl: avatarUrl.trim() || undefined,
            });
            setUser(updated);
            setMessage('✅ Сохранено');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <button className="profile-back" onClick={() => navigate('/projects')}>
                <ArrowLeft size={16} />
                Назад
            </button>

            <h1 className="profile-title">
                <span className="profile-title-icon">
                    <UserIcon size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Мой профиль
            </h1>

            {loading ? (
                <div className="profile-loading">Загрузка...</div>
            ) : !user ? (
                <div className="profile-error">{error || 'User not found'}</div>
            ) : (
                <div className="profile-card">
                    <div className="profile-avatar-block">
                        <div className="profile-avatar">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} />
                            ) : (
                                <UserIcon size={32} />
                            )}
                        </div>
                        <div className="profile-email">
                            <Mail size={14} />
                            {user.email}
                        </div>
                    </div>

                    <div className="profile-fields">
                        <Input
                            label="Имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя"
                        />

                        <Input
                            label="URL аватара"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    {error && <div className="profile-message profile-message-error">{error}</div>}
                    {message && <div className="profile-message profile-message-success">{message}</div>}

                    <div className="profile-actions">
                        <Button onClick={handleSave} loading={saving}>
                            <Save size={16} />
                            Сохранить
                        </Button>
                    </div>

                    <div className="profile-skills">
                        <h3 className="profile-skills-title">
                            <Sparkles size={18} />
                            Мои навыки ({skills.length})
                        </h3>

                        {skillsLoading ? (
                            <div className="profile-skills-empty">Загрузка...</div>
                        ) : skills.length === 0 ? (
                            <div className="profile-skills-empty">
                                Пока нет навыков. Закрывай задачи с тегами, связанными со skills.
                            </div>
                        ) : (
                            <div className="profile-skills-list">
                                {skills.map((us) => (
                                    <div
                                        key={us.id}
                                        className="profile-skill profile-skill-clickable"
                                        onClick={() => setOpenedSkillId(us.id)}
                                    >
                                        <div className="profile-skill-header">
                                            <div className="profile-skill-name">
                                                {us.skill?.label ?? 'Навык'}
                                                {us.skill?.type === 'SOFT' && (
                                                    <span className="profile-skill-type">Soft</span>
                                                )}
                                            </div>
                                            <div className="profile-skill-level">
                                                {us.levelLabel} · {us.level}/10
                                            </div>
                                        </div>

                                        <div className="profile-skill-bar">
                                            <div
                                                className="profile-skill-bar-fill"
                                                style={{ width: `${us.level * 10}%` }}
                                            />
                                        </div>

                                        <div className="profile-skill-meta">
                                            <TrendingUp size={12} />
                                            Практика: {us.practiceCount}
                                            {us.context && ` · ${us.context.name}`}
                                            {us.lastUsedAt && ` · ${new Date(us.lastUsedAt).toLocaleDateString('ru-RU')}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {xp && (
                        <div className="profile-xp">
                            <h3 className="profile-xp-title">
                                <Trophy size={18} />
                                Опыт
                                <InfoPopup title="Что такое XP?">
                                    <p>
                                        <strong>XP (experience)</strong> — это очки опыта,
                                        которые ты получаешь за вклад в проект.
                                    </p>
                                    <p>
                                        <strong>За что начисляется:</strong>
                                    </p>
                                    <ul>
                                        <li>Закрытые задачи</li>
                                        <li>Инкременты (что команда сделала)</li>
                                        <li>События спринта (успех, факап, пивот)</li>
                                        <li>Достигнутые цели и метрики</li>
                                    </ul>
                                    <p>
                                        <strong>Зачем это нужно:</strong> XP — это прозрачный
                                        сигнал твоего вклада. Не оценка «хороший/плохой»,
                                        а факт: сколько ты сделал. Растёт — значит, растёшь.
                                    </p>
                                </InfoPopup>
                            </h3>

                            <RankBadge totalXp={xp.total} />

                            <div className="profile-xp-total">
                                <span className="profile-xp-total-value">
                                    {xp.total}
                                </span>
                                <span className="profile-xp-total-label">XP всего</span>
                            </div>

                            {xp.bySource.length > 0 && (
                                <div className="profile-xp-sources">
                                    {xp.bySource.map((s) => (
                                        <div key={s.source} className="profile-xp-source">
                                            <span className="profile-xp-source-label">
                                                {XP_SOURCE_LABELS[s.source] ?? s.source}
                                            </span>
                                            <span className="profile-xp-source-value">
                                                +{s.total}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {xp.history.length > 0 && (
                                <div className="profile-xp-history">
                                    <h4 className="profile-xp-history-title">История</h4>
                                    <div className="profile-xp-history-list">
                                        {xp.history.map((h) => (
                                            <div key={h.id} className="profile-xp-history-item">
                                                <div className="profile-xp-history-content">
                                                    <div className="profile-xp-history-label">
                                                        {XP_SOURCE_LABELS[h.source] ?? h.source}
                                                    </div>
                                                    {h.note && (
                                                        <div className="profile-xp-history-note">
                                                            {h.note}
                                                        </div>
                                                    )}
                                                    <div className="profile-xp-history-date">
                                                        {new Date(h.createdAt).toLocaleString('ru-RU')}
                                                    </div>
                                                </div>
                                                <div className="profile-xp-history-amount">
                                                    +{h.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {achievements.length > 0 && (
                        <div className="profile-achievements">
                            <h3 className="profile-achievements-title">
                                <Award size={18} />
                                Ачивки ({achievements.length})
                                <InfoPopup title="Что такое ачивки?">
                                    <p>
                                        <strong>Ачивки</strong> — это награды за достижения.
                                        Два типа:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Автоматические</strong> — выдаются системой
                                            за объективные результаты: закрыл 10 задач,
                                            завершил спринт без просрочек, достиг метрики.
                                        </li>
                                        <li>
                                            <strong>Ручные</strong> — PO или ментор награждает
                                            за нестандартное: идею, помощь коллеге, героизм.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>Зачем:</strong> ачивки — это признание.
                                        Не оценка «хороший/плохой», а факт: «мы заметили,
                                        что ты сделал».
                                    </p>
                                </InfoPopup>
                            </h3>

                            <div className="profile-achievements-list">
                                {achievements.map((ua) => (
                                    <div
                                        key={ua.id}
                                        className="profile-achievement"
                                        title={ua.achievement.description ?? undefined}
                                    >
                                        <div className="profile-achievement-icon">
                                            {ua.achievement.icon ?? '🏆'}
                                        </div>
                                        <div className="profile-achievement-content">
                                            <div className="profile-achievement-label">
                                                {ua.achievement.label}
                                            </div>
                                            {ua.note && (
                                                <div className="profile-achievement-note">
                                                    {ua.note}
                                                </div>
                                            )}
                                            <div className="profile-achievement-meta">
                                                {new Date(ua.grantedAt).toLocaleDateString('ru-RU')}
                                                {ua.grantedBy && (
                                                    <> · от {ua.grantedBy.name ?? ua.grantedBy.email}</>
                                                )}
                                                {ua.achievement.xpReward > 0 && (
                                                    <> · +{ua.achievement.xpReward} XP</>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!skillsLoading && skills.length > 0 && (
                        <div className="profile-xmatrix">
                            <XMatrix
                                userSkills={skills}
                                spheres={spheres}
                                geographies={geographies}
                            />
                        </div>
                    )}

                    <div className="profile-meta">
                        ID: {user.id.slice(0, 8)}...
                        {user.createdAt && ` · Создан: ${new Date(user.createdAt).toLocaleDateString('ru-RU')}`}
                    </div>
                </div>
            )}

            {openedSkillId && (
                <SkillDetailPopup
                    userSkillId={openedSkillId}
                    onClose={() => setOpenedSkillId(null)}
                />
            )}
        </div>
    );
}