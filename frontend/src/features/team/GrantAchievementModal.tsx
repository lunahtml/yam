//frontend/src/features/team/GrantAchievementModal.tsx
import { useEffect, useState } from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { Achievement } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './GrantAchievementModal.css';

interface GrantAchievementModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
    onGranted: () => void;
}

export default function GrantAchievementModal({
    userId,
    userName,
    onClose,
    onGranted,
}: GrantAchievementModalProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string>('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.getMyOrganizations().then(async (orgs) => {
            if (orgs.length === 0) {
                setLoading(false);
                return;
            }
            const data = await api.getAchievements(orgs[0].id);
            setAchievements(data.filter((a) => !a.isAutomatic));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleGrant = async () => {
        if (!selectedId) return;
        setSaving(true);
        setError('');
        try {
            await api.grantAchievement(selectedId, {
                userId,
                note: note.trim() || undefined,
            });
            setSuccess(true);
            setTimeout(() => {
                onGranted();
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to grant');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grant-achievement-overlay" onClick={onClose}>
            <div className="grant-achievement" onClick={(e) => e.stopPropagation()}>
                <div className="grant-achievement-header">
                    <h2 className="grant-achievement-title">
                        <Award size={20} />
                        Наградить ачивкой
                    </h2>
                    <button className="grant-achievement-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="grant-achievement-body">
                    <div className="grant-achievement-user">
                        Кому: <strong>{userName}</strong>
                    </div>

                    {error && <div className="grant-achievement-error">{error}</div>}

                    {success ? (
                        <div className="grant-achievement-success">
                            <CheckCircle2 size={32} />
                            <p>Ачивка выдана!</p>
                        </div>
                    ) : loading ? (
                        <div className="grant-achievement-loading">Загрузка...</div>
                    ) : achievements.length === 0 ? (
                        <div className="grant-achievement-empty">
                            Нет ручных ачивок в организации. Создай их в настройках проекта.
                        </div>
                    ) : (
                        <>
                            <div className="grant-achievement-list">
                                {achievements.map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        className={`grant-achievement-item ${selectedId === a.id ? 'grant-achievement-item-active' : ''}`}
                                        onClick={() => setSelectedId(a.id)}
                                    >
                                        <div className="grant-achievement-item-icon">
                                            {a.icon ?? '🏆'}
                                        </div>
                                        <div className="grant-achievement-item-content">
                                            <div className="grant-achievement-item-label">
                                                {a.label}
                                            </div>
                                            {a.description && (
                                                <div className="grant-achievement-item-desc">
                                                    {a.description}
                                                </div>
                                            )}
                                        </div>
                                        {a.xpReward > 0 && (
                                            <div className="grant-achievement-item-xp">
                                                +{a.xpReward}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Input
                                label="Комментарий (за что)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="За нестандартное решение"
                            />
                        </>
                    )}
                </div>

                {!success && achievements.length > 0 && (
                    <div className="grant-achievement-footer">
                        <Button
                            onClick={handleGrant}
                            loading={saving}
                            disabled={!selectedId}
                        >
                            <Award size={16} />
                            Выдать
                        </Button>
                        <Button onClick={onClose} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}