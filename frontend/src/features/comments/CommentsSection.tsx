//frontend/src/features/comments/CommentsSection.tsx
import { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2, Pencil, X, Check } from 'lucide-react';
import { api } from '../../api/client';
import { Comment } from '../../types/api';
import './CommentsSection.css';

interface CommentsSectionProps {
    recordId: string;
    currentUserId: string;
    isAdmin?: boolean;
}

export default function CommentsSection({
    recordId,
    currentUserId,
    isAdmin = false,
}: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getComments(recordId);
            setComments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [recordId]);

    const handleSend = async () => {
        if (!body.trim()) return;
        setSending(true);
        setError('');
        try {
            const created = await api.createComment(recordId, {
                body: body.trim(),
            });
            setComments([...comments, created]);
            setBody('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const handleEdit = (c: Comment) => {
        setEditingId(c.id);
        setEditBody(c.body);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editBody.trim()) return;
        try {
            const updated = await api.updateComment(id, { body: editBody.trim() });
            setComments(comments.map((c) => (c.id === id ? updated : c)));
            setEditingId(null);
            setEditBody('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить комментарий?')) return;
        try {
            await api.deleteComment(id);
            setComments(comments.filter((c) => c.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const getInitials = (str: string): string => {
        const parts = str.split(/[\s@.]+/).filter((p) => p.length > 0);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <div className="comments-section">
            <h3 className="comments-title">
                <MessageSquare size={18} />
                Комментарии ({comments.length})
            </h3>

            {error && <div className="comments-error">{error}</div>}

            <div className="comments-list">
                {loading ? (
                    <div className="comments-loading">Загрузка...</div>
                ) : comments.length === 0 ? (
                    <div className="comments-empty">
                        Пока нет комментариев. Напиши первый.
                    </div>
                ) : (
                    comments.map((c) => {
                        const canEdit = c.userId === currentUserId;
                        const canDelete = c.userId === currentUserId || isAdmin;
                        const isEditing = editingId === c.id;

                        return (
                            <div key={c.id} className="comment-item">
                                <div className="comment-avatar">
                                    {c.user.avatarUrl ? (
                                        <img src={c.user.avatarUrl} alt="" />
                                    ) : (
                                        getInitials(c.user.name ?? c.user.email)
                                    )}
                                </div>

                                <div className="comment-content">
                                    <div className="comment-header">
                                        <div className="comment-author">
                                            {c.user.name ?? c.user.email}
                                        </div>
                                        <div className="comment-date">
                                            {formatTime(c.createdAt)}
                                        </div>

                                        <div className="comment-actions">
                                            {canEdit && !isEditing && (
                                                <button
                                                    className="comment-action"
                                                    onClick={() => handleEdit(c)}
                                                    title="Редактировать"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            )}
                                            {canDelete && !isEditing && (
                                                <button
                                                    className="comment-action comment-action-delete"
                                                    onClick={() => handleDelete(c.id)}
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing ? (
                                        <div className="comment-edit">
                                            <textarea
                                                className="comment-edit-textarea"
                                                value={editBody}
                                                onChange={(e) => setEditBody(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="comment-edit-actions">
                                                <button
                                                    className="comment-btn comment-btn-primary"
                                                    onClick={() => handleSaveEdit(c.id)}
                                                >
                                                    <Check size={14} />
                                                    Сохранить
                                                </button>
                                                <button
                                                    className="comment-btn comment-btn-secondary"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditBody('');
                                                    }}
                                                >
                                                    <X size={14} />
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="comment-body">{c.body}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="comments-form">
                <textarea
                    className="comments-textarea"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Написать комментарий..."
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <div className="comments-form-actions">
                    <span className="comments-hint">
                        Ctrl+Enter — отправить
                    </span>
                    <button
                        className="comments-send"
                        onClick={handleSend}
                        disabled={sending || !body.trim()}
                    >
                        <Send size={14} />
                        {sending ? 'Отправка...' : 'Отправить'}
                    </button>
                </div>
            </div>
        </div>
    );
}