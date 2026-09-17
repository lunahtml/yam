//frontend/src/pages/dashboard/artifacts/ArtifactForm.tsx
import { useState } from 'react';
import {
    Globe,
    Smartphone,
    FileText,
    BarChart3,
    Video,
    Folder,
    Building2,
    Link as LinkIcon,
    Plus,
    LucideIcon,
} from 'lucide-react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { ArtifactType } from '../../../types/api';

interface ArtifactFormProps {
    onSubmit: (data: {
        type: ArtifactType;
        name: string;
        url?: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }) => Promise<void>;
    loading?: boolean;
}

const TYPES: { value: ArtifactType; label: string; icon: LucideIcon }[] = [
    { value: 'WEBSITE', label: 'Сайт', icon: Globe },
    { value: 'SOCIAL', label: 'Соцсеть', icon: Smartphone },
    { value: 'DOCUMENT', label: 'Документ', icon: FileText },
    { value: 'DASHBOARD', label: 'Дашборд', icon: BarChart3 },
    { value: 'VIDEO', label: 'Видео', icon: Video },
    { value: 'FILE', label: 'Файл', icon: Folder },
    { value: 'OFFLINE', label: 'Офлайн', icon: Building2 },
    { value: 'CUSTOM', label: 'Другое', icon: LinkIcon },
];

export default function ArtifactForm({ onSubmit, loading }: ArtifactFormProps) {
    const [type, setType] = useState<ArtifactType>('WEBSITE');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) return;

        const metadata: Record<string, unknown> = {};
        if (type === 'OFFLINE' && address) {
            metadata.address = address;
        }

        await onSubmit({
            type,
            name,
            url: url || undefined,
            description: description || undefined,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });

        setName('');
        setUrl('');
        setDescription('');
        setAddress('');
    };

    return (
        <div
            style={{
                background: 'var(--bg-surface)',
                padding: 24,
                borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                height: 'fit-content',
            }}
        >
            <h3
                style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 16,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <Plus size={18} />
                Новый артефакт
            </h3>

            {/* Тип */}
            <div style={{ marginBottom: 16 }}>
                <label
                    style={{
                        display: 'block',
                        marginBottom: 8,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                    }}
                >
                    Тип
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TYPES.map((t) => {
                        const Icon = t.icon;
                        const isActive = type === t.value;

                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                style={{
                                    padding: '7px 12px',
                                    fontSize: 12,
                                    border: '1px solid',
                                    borderColor: isActive
                                        ? 'var(--accent)'
                                        : 'var(--border)',
                                    background: isActive
                                        ? 'rgba(168, 85, 247, 0.15)'
                                        : 'var(--bg-elevated)',
                                    color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.15s',
                                    fontWeight: isActive ? 600 : 500,
                                }}
                            >
                                <Icon size={14} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Input
                label="Название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Основной сайт"
            />

            <Input
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
            />

            {type === 'OFFLINE' && (
                <Input
                    label="Адрес"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Город, улица, дом"
                />
            )}

            <Input
                label="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание"
            />

            <Button onClick={handleSubmit} loading={loading}>
                <Plus size={16} />
                Создать
            </Button>
        </div>
    );
}