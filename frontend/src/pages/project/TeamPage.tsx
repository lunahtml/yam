//frontend/src/pages/project/TeamPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { ProjectMember } from '../../types/api';
import Button from '../../components/Button';
import AddMemberModal from './AddMemberModal';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './TeamPage.css';

export default function TeamPage() {
    const { projectId } = useOutletContext<ProjectContext>();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getProjectMembers(projectId);
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [projectId]);

    const handleRemove = async (memberId: string) => {
        if (!confirm('Удалить участника из проекта?')) return;
        try {
            await api.removeProjectMember(projectId, memberId);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove');
        }
    };

    return (
        <div className="team-page">
            <div className="team-header">
                <h1 className="team-title">
                    <span className="team-title-icon">
                        <Users size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Команда проекта ({members.length})
                </h1>

                <Button
                    onClick={() => setShowAdd(true)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Добавить участника
                </Button>
            </div>

            {error && <div className="team-error">{error}</div>}

            {loading ? (
                <div className="team-loading">Загрузка...</div>
            ) : members.length === 0 ? (
                <div className="team-empty">
                    Пока нет участников. Добавь первого.
                </div>
            ) : (
                <div className="team-grid">
                    {members.map((m) => (
                        <div key={m.id} className="team-member">
                            <div className="team-member-header">
                                {m.user.avatarUrl ? (
                                    <img
                                        src={m.user.avatarUrl}
                                        alt=""
                                        className="team-member-avatar"
                                    />
                                ) : (
                                    <div className="team-member-avatar team-member-avatar-placeholder">
                                        {getInitials(m.user.name ?? m.user.email)}
                                    </div>
                                )}

                                <div className="team-member-info">
                                    <div className="team-member-name">
                                        {m.user.name ?? m.user.email}
                                    </div>
                                    {m.user.name && (
                                        <div className="team-member-email">{m.user.email}</div>
                                    )}
                                </div>

                                <div className="team-member-role">{m.role}</div>

                                <button
                                    className="team-member-remove"
                                    onClick={() => handleRemove(m.id)}
                                    title="Удалить"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {m.skills && m.skills.length > 0 && (
                                <div className="team-member-skills">
                                    {m.skills.map((s) => (
                                        <div key={s.id} className="team-skill-chip">
                                            <span className="team-skill-name">
                                                {s.skill.label}
                                            </span>
                                            <span className="team-skill-level">
                                                {s.levelLabel ?? s.level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showAdd && (
                <AddMemberModal
                    projectId={projectId}
                    existingMemberIds={members.map((m) => m.userId)}
                    onClose={() => setShowAdd(false)}
                    onAdded={() => {
                        setShowAdd(false);
                        load();
                    }}
                />
            )}
        </div>
    );
}

function getInitials(str: string): string {
    const parts = str.split(/[\s@.]+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}