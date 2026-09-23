//frontend/src/pages/projects/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Sparkles, TrendingUp } from 'lucide-react';
import { UserSkill, User } from '../../types/api';
import { api } from '../../api/client';
import Input from '../../components/Input';
import SkillDetailPopup from './SkillDetailPopup';
import Button from '../../components/Button';
import './ProfilePage.css';

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
    const [openedSkillId, setOpenedSkillId] = useState<string | null>(null);
    const [skillsLoading, setSkillsLoading] = useState(true);

    useEffect(() => {
        api
            .getMe()
            .then((u) => {
                setUser(u);
                setName(u.name ?? '');
                setAvatarUrl(u.avatarUrl ?? '');

                api
                    .getUserSkills(u.id)
                    .then(setSkills)
                    .catch(() => { })
                    .finally(() => setSkillsLoading(false));
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