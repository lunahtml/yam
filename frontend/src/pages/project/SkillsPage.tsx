//frontend/src/pages/project/SkillsPage.tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Cpu, Heart, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Skill, SkillType } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './SkillsPage.css';

interface SkillsPageProps {
    organizationId: string;
}

export default function SkillsPage({ organizationId }: SkillsPageProps) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<SkillType>('HARD');
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getSkills(organizationId);
            setSkills(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organizationId) load();
    }, [organizationId]);

    const handleCreate = async () => {
        if (!name.trim() || !label.trim()) return;
        setSaving(true);
        setError('');

        try {
            await api.createSkill({
                organizationId,
                name: name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
                label: label.trim(),
                description: description.trim() || undefined,
                type,
            });
            setName('');
            setLabel('');
            setDescription('');
            setType('HARD');
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить навык?')) return;
        try {
            await api.deleteSkill(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const hardSkills = skills.filter((s) => s.type === 'HARD');
    const softSkills = skills.filter((s) => s.type === 'SOFT');

    return (
        <div className="skills-page">
            <div className="skills-header">
                <h1 className="skills-title">
                    <span className="skills-title-icon">
                        <Sparkles size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Навыки организации
                </h1>

                <Button
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Новый навык
                </Button>
            </div>

            {error && <div className="skills-error">{error}</div>}

            {showForm && (
                <div className="skills-form">
                    <h3 className="skills-form-title">Новый навык</h3>

                    <div className="skills-type-selector">
                        <button
                            className={`skills-type-btn ${type === 'HARD' ? 'skills-type-btn-active' : ''}`}
                            onClick={() => setType('HARD')}
                            type="button"
                        >
                            <Cpu size={14} /> Hard
                        </button>
                        <button
                            className={`skills-type-btn ${type === 'SOFT' ? 'skills-type-btn-active' : ''}`}
                            onClick={() => setType('SOFT')}
                            type="button"
                        >
                            <Heart size={14} /> Soft
                        </button>
                    </div>

                    <Input
                        label="Название (латиница)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="backend"
                    />
                    <Input
                        label="Отображаемое имя"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Backend Development"
                    />
                    <Input
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Разработка серверной части"
                    />

                    <div className="skills-form-actions">
                        <Button onClick={handleCreate} loading={saving}>
                            <Plus size={16} /> Создать
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="secondary">
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="skills-loading">Загрузка...</div>
            ) : (
                <div className="skills-columns">
                    <SkillColumn
                        title="Hard Skills"
                        icon={Cpu}
                        skills={hardSkills}
                        onDelete={handleDelete}
                    />
                    <SkillColumn
                        title="Soft Skills"
                        icon={Heart}
                        skills={softSkills}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </div>
    );
}

function SkillColumn({
    title,
    icon: Icon,
    skills,
    onDelete,
}: {
    title: string;
    icon: LucideIcon;
    skills: Skill[];
    onDelete: (id: string) => void;
}) {
    return (
        <div className="skills-column">
            <h2 className="skills-column-title">
                <Icon size={18} />
                {title} ({skills.length})
            </h2>

            {skills.length === 0 ? (
                <div className="skills-column-empty">Пока нет</div>
            ) : (
                <div className="skills-column-list">
                    {skills.map((s) => (
                        <div key={s.id} className="skills-item">
                            <div className="skills-item-content">
                                <div className="skills-item-label">{s.label}</div>
                                <div className="skills-item-name">{s.name}</div>
                                {s.description && (
                                    <div className="skills-item-desc">{s.description}</div>
                                )}
                            </div>
                            <button
                                className="skills-item-delete"
                                onClick={() => onDelete(s.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}