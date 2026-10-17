//frontend/src/features/comments/CommentsSection.tsx
import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send, Trash2, Pencil, X, Check, CornerDownRight } from 'lucide-react';
import { api } from '../../api/client';
import { Comment } from '../../types/api';
import MentionPicker from './MentionPicker';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './CommentsSection.css';

interface CommentsSectionProps {
    recordId: string;
    currentUserId: string;
    isAdmin?: boolean;
    /** Если false — только чтение */
    canComment?: boolean;
}

interface Member {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
}

export default function CommentsSection({
    recordId,
    currentUserId,
    isAdmin = false,
    canComment = true,
}: CommentsSectionProps) {
    const { organizationId } = useOutletContext<ProjectContext>();
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    // Mention
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId]);

    const handleBodyChange = (value: string, textarea: HTMLTextAreaElement) => {
        setBody(value);

        const cursor = textarea.selectionStart;
        const before = value.slice(0, cursor);
        const atIndex = before.lastIndexOf('@');

        if (atIndex >= 0) {
            const afterAt = before.slice(atIndex + 1);
            // Открываем меншены только если после @ нет пробелов/переносов
            if (!/[\s\n]/.test(afterAt)) {
                setMentionOpen(true);
                setMentionQuery(afterAt);
                setMentionStartPos(atIndex);
                return;
            }
        }
        setMentionOpen(false);
    };

    const handleMentionSelect = (member: Member) => {
        if (mentionStartPos === null) return;
        const before = body.slice(0, mentionStartPos);
        const after = body.slice(mentionStartPos + mentionQuery.length + 1);
        const mentionText = `@[${member.name ?? member.email}](${member.id}) `;
        const newBody = `${before}${mentionText}${after}`;
        setBody(newBody);
        setMentionOpen(false);
        setMentionStartPos(null);
        setMentionQuery('');
        textareaRef.current?.focus();
    };

    const handleSend = async () => {
        if (!body.trim()) return;
        setSending(true);
        setError('');
        try {
            const created = await api.createComment(recordId, {
                body: body.trim(),
                parentId: replyTo?.id,
            });
            // Перезагружаем — сервер вернёт дерево
            await load();
            setBody('');
            setReplyTo(null);
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
            setComments((prev) =>
                prev.map((c) => {
                    if (c.id === id) return { ...c, body: updated.body };
                    if (c.replies) {
                        return {
                            ...c,
                            replies: c.replies.map((r) =>
                                r.id === id ? { ...r, body: updated.body } : r,
                            ),
                        };
                    }
                    return c;
                }),
            );
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
            await load();
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

    /**
     * Рендер тела коммента с меншенами и ссылками на задачи.
     * Меншен формата @[Имя](userId) → кликабельный чип.
     */
    const renderBody = (text: string): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        const regex = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)/gi;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let key = 0;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            const [, name, userId] = match;
            parts.push(
                <span
                    key={`mention-${key++}`}
                    className="comment-mention"
                    title={userId}
                >
                    @{name}
                </span>,
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    };

    const renderComment = (c: Comment, isReply = false) => {
        const canEdit = c.userId === currentUserId;
        const canDelete = c.userId === currentUserId || isAdmin;
        const isEditing = editingId === c.id;

        return (
            <div
                key={c.id}
                className={`comment-item ${isReply ? 'comment-item-reply' : ''}`}
            >
                {isReply && <CornerDownRight size={14} className="comment-reply-icon" />}

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
                        <div className="comment-date">{formatTime(c.createdAt)}</div>

                        <div className="comment-actions">
                            {canComment && !isReply && !isEditing && (
                                <button
                                    className="comment-action"
                                    onClick={() => setReplyTo(c)}
                                    title="Ответить"
                                >
                                    <CornerDownRight size={12} />
                                </button>
                            )}
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
                        <div className="comment-body">{renderBody(c.body)}</div>
                    )}
                </div>
            </div>
        );
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
                    comments.map((c) => (
                        <div key={c.id} className="comment-thread">
                            {renderComment(c)}
                            {c.replies && c.replies.length > 0 && (
                                <div className="comment-replies">
                                    {c.replies.map((r) => renderComment(r, true))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {canComment && (
                <div className="comments-form">
                    {replyTo && (
                        <div className="comment-reply-banner">
                            <CornerDownRight size={12} />
                            Ответ на комментарий {replyTo.user.name ?? replyTo.user.email}
                            <button
                                className="comment-reply-cancel"
                                onClick={() => setReplyTo(null)}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <div className="comments-form-wrap">
                        <textarea
                            ref={textareaRef}
                            className="comments-textarea"
                            value={body}
                            onChange={(e) => handleBodyChange(e.target.value, e.target)}
                            placeholder={
                                replyTo
                                    ? 'Написать ответ...'
                                    : 'Написать комментарий... (Ctrl+Enter — отправить, @ — упомянуть)'
                            }
                            rows={3}
                            onKeyDown={(e) => {
                                if (mentionOpen) return; // MentionPicker обрабатывает свои клавиши
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        {mentionOpen && organizationId && (
                            <MentionPicker
                                organizationId={organizationId}
                                query={mentionQuery}
                                onSelect={handleMentionSelect}
                                onClose={() => setMentionOpen(false)}
                            />
                        )}
                    </div>

                    <div className="comments-form-actions">
                        <span className="comments-hint">Ctrl+Enter — отправить</span>
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
            )}
        </div>
    );
}