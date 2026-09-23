//frontend/src/pages/project/TagsPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Tag, Skill, Category } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import './TagsPage.css';

export default function TagsPage() {
    const { organizationId } = useOutletContext<ProjectContext>();
    const [tags, setTags] = useState<Tag[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [icon, setIcon] = useState('');
    const [color, setColor] = useState('');
    const [skillId, setSkillId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [tagsData, skillsData, categoriesData] = await Promise.all([
                api.getTags(organizationId),
                api.getSkills(organizationId),
                api.getCategories(organizationId, 'TAG'),
            ]);
            setTags(tagsData);
            setSkills(skillsData);
            setCategories(categoriesData);
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
            await api.createTag({
                organizationId,
                name: name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
                label: label.trim(),
                icon: icon.trim() || undefined,
                color: color.trim() || undefined,
                skillId: skillId || undefined,
                categoryId: categoryId || undefined,
            });
            setName('');
            setLabel('');
            setIcon('');
            setColor('');
            setSkillId('');
            setCategoryId('');
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить тег?')) return;
        try {
            await api.deleteTag(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    if (!organizationId) {
        return <div className="tags-loading">Загрузка...</div>;
    }

    return (
        <div className="tags-page">
            <div className="tags-header">
                <h1 className="tags-title">
                    <span className="tags-title-icon">
                        <TagIcon size={22} color="#fff" strokeWidth={2.5} />
                    </span>
                    Теги организации
                </h1>

                <Button
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    <Plus size={16} />
                    Новый тег
                </Button>
            </div>

            {error && <div className="tags-error">{error}</div>}

            {showForm && (
                <div className="tags-form">
                    <h3 className="tags-form-title">Новый тег</h3>

                    <div className="tags-form-grid">
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
                            placeholder="Backend"
                        />
                        <Input
                            label="Иконка"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="⚙️"
                        />
                        <Input
                            label="Цвет"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="#a855f7"
                        />
                    </div>

                    <div className="tags-form-select">
                        <label className="tags-form-label">Связь со skill</label>
                        <select
                            className="tags-form-select-input"
                            value={skillId}
                            onChange={(e) => setSkillId(e.target.value)}
                        >
                            <option value="">— Не связан —</option>
                            {skills.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label} ({s.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="tags-form-select">
                        <label className="tags-form-label">Категория</label>
                        <select
                            className="tags-form-select-input"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">— Без категории —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="tags-form-actions">
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
                <div className="tags-loading">Загрузка...</div>
            ) : tags.length === 0 ? (
                <div className="tags-empty">
                    Пока нет тегов. Создай первый.
                </div>
            ) : (
                <div className="tags-list">
                    {tags.map((tag) => (
                        <div key={tag.id} className="tag-item">
                            <div className="tag-item-icon">
                                {tag.icon ?? '#'}
                            </div>

                            <div className="tag-item-content">
                                <div className="tag-item-label">{tag.label}</div>
                                <div className="tag-item-name">#{tag.name}</div>
                            </div>

                            {tag.skill && (
                                <div className="tag-item-skill">
                                    Skill: {tag.skill.label}
                                </div>
                            )}

                            {tag.category && (
                                <div className="tag-item-category">
                                    {tag.category.name}
                                </div>
                            )}

                            <button
                                className="tag-item-delete"
                                onClick={() => handleDelete(tag.id)}
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