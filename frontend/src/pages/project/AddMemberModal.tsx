//frontend/src/pages/project/AddMemberModal.tsx
import { useEffect, useState } from 'react';
import { X, Search, UserPlus, Mail } from 'lucide-react';
import { api } from '../../api/client';
import { User } from '../../types/api';
// import Button from '../../components/Button';
import './AddMemberModal.css';

interface AddMemberModalProps {
    projectId: string;
    existingMemberIds: string[];
    onClose: () => void;
    onAdded: () => void;
}

export default function AddMemberModal({
    projectId,
    existingMemberIds,
    onClose,
    onAdded,
}: AddMemberModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEmail = query.includes('@');

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const t = setTimeout(() => {
            api
                .searchUsers(query.trim(), 10)
                .then((users) =>
                    setResults(
                        users.filter((u) => !existingMemberIds.includes(u.id)),
                    ),
                )
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(t);
    }, [query, existingMemberIds]);

    const handleAdd = async (user: User) => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.addProjectMember(projectId, {
                userId: user.id,
                role,
            });
            onAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add');
        } finally {
            setSaving(false);
        }
    };

    const handleInviteByEmail = async () => {
        if (!isEmail) return;
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.createInvitation(projectId, {
                email: query.trim().toLowerCase(),
                role,
            });
            setSuccess(`✅ Приглашение отправлено на ${query.trim()}`);
            setQuery('');
            setResults([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to invite');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-member-overlay" onClick={onClose}>
            <div className="add-member" onClick={(e) => e.stopPropagation()}>
                <div className="add-member-header">
                    <h3 className="add-member-title">Добавить участника</h3>
                    <button className="add-member-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="add-member-role">
                    <label className="add-member-label">Роль в проекте</label>
                    <select
                        className="add-member-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="member">Участник</option>
                        <option value="admin">Администратор</option>
                        <option value="viewer">Наблюдатель</option>
                    </select>
                </div>

                <div className="add-member-search">
                    <Search size={14} className="add-member-search-icon" />
                    <input
                        className="add-member-search-input"
                        placeholder="Имя, email или приглашение по email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {error && <div className="add-member-error">{error}</div>}
                {success && (
                    <div className="add-member-success">{success}</div>
                )}

                <div className="add-member-results">
                    {loading ? (
                        <div className="add-member-empty">Поиск...</div>
                    ) : query.trim().length < 2 ? (
                        <div className="add-member-empty">
                            Начни вводить имя или email
                        </div>
                    ) : results.length === 0 ? (
                        isEmail ? (
                            <button
                                className="add-member-item add-member-invite"
                                onClick={handleInviteByEmail}
                                disabled={saving}
                                type="button"
                            >
                                <div className="add-member-avatar add-member-avatar-invite">
                                    <Mail size={18} />
                                </div>
                                <div className="add-member-item-info">
                                    <div className="add-member-item-name">
                                        Пригласить {query.trim()}
                                    </div>
                                    <div className="add-member-item-email">
                                        Отправить приглашение на email
                                    </div>
                                </div>
                                <UserPlus size={16} className="add-member-item-icon" />
                            </button>
                        ) : (
                            <div className="add-member-empty">Никого не найдено</div>
                        )
                    ) : (
                        results.map((u) => (
                            <button
                                key={u.id}
                                className="add-member-item"
                                onClick={() => handleAdd(u)}
                                disabled={saving}
                                type="button"
                            >
                                {u.avatarUrl ? (
                                    <img
                                        src={u.avatarUrl}
                                        alt=""
                                        className="add-member-avatar"
                                    />
                                ) : (
                                    <div className="add-member-avatar add-member-avatar-placeholder">
                                        {getInitials(u.name ?? u.email)}
                                    </div>
                                )}
                                <div className="add-member-item-info">
                                    <div className="add-member-item-name">
                                        {u.name ?? u.email}
                                    </div>
                                    {u.name && (
                                        <div className="add-member-item-email">{u.email}</div>
                                    )}
                                </div>
                                <UserPlus size={16} className="add-member-item-icon" />
                            </button>
                        ))
                    )}
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