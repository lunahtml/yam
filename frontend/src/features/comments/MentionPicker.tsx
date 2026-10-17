//frontend/src/features/comments/MentionPicker.tsx
import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client';

interface Member {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
}

interface MentionPickerProps {
    organizationId: string;
    query: string;
    onSelect: (member: Member) => void;
    onClose: () => void;
}

export default function MentionPicker({
    organizationId,
    query,
    onSelect,
    onClose,
}: MentionPickerProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!organizationId) return;
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(() => {
            api
                .getOrganizationMembers(organizationId, query, 10)
                .then((data) => {
                    if (!cancelled) {
                        setMembers(data);
                        setActiveIndex(0);
                    }
                })
                .catch(() => { })
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        }, 200);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [organizationId, query]);

    // Закрытие по клику вне
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, members.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (members[activeIndex]) onSelect(members[activeIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    return (
        <div
            ref={containerRef}
            className="mention-picker"
            onKeyDown={handleKey}
        >
            {loading && members.length === 0 ? (
                <div className="mention-picker-loading">Поиск...</div>
            ) : members.length === 0 ? (
                <div className="mention-picker-empty">Никого не найдено</div>
            ) : (
                members.map((m, i) => (
                    <button
                        key={m.id}
                        type="button"
                        className={`mention-picker-item ${i === activeIndex ? 'mention-picker-item-active' : ''
                            }`}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => onSelect(m)}
                    >
                        {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt="" className="mention-picker-avatar" />
                        ) : (
                            <div className="mention-picker-avatar mention-picker-avatar-placeholder">
                                {getInitials(m.name ?? m.email)}
                            </div>
                        )}
                        <div className="mention-picker-info">
                            <div className="mention-picker-name">
                                {m.name ?? m.email}
                            </div>
                            {m.name && (
                                <div className="mention-picker-email">{m.email}</div>
                            )}
                        </div>
                    </button>
                ))
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