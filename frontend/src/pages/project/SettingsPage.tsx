//frontend/src/pages/project/SettingsPage.tsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Trophy, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { Achievement } from '../../types/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import InfoPopup from '../../components/InfoPopup';
import type { ProjectContext } from '../../layouts/ProjectLayout';
import {
    AUTOMATIC_TEMPLATES,
    MANUAL_TEMPLATES,
    ALL_TEMPLATES,
} from '../../features/gamification/achievementTemplates';
import './SettingsPage.css';

export default function SettingsPage() {
    const { projectId } = useOutletContext<ProjectContext>();

    const [organizationId, setOrganizationId] = useState('');
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [code, setCode] = useState('');
    const [label, setLabel] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [description, setDescription] = useState('');
    const [xpReward, setXpReward] = useState('0');
    const [isAutomatic, setIsAutomatic] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    // Загружаем organizationId из проекта
    useEffect(() => {
        if (!projectId) return;
        api
            .getProject(projectId)
            .then(async (project) => {
                if (project.workspaceId) {
                    const ws = await api.getWorkspace(project.workspaceId);
                    if (ws?.organizationId) {
                        setOrganizationId(ws.organizationId);
                    }
                }
            })
            .catch(() => { });
    }, [projectId]);

    const load = async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const data = await api.getAchievements(organizationId);
            setAchievements(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organizationId) load();
    }, [organizationId]);

    const resetForm = () => {
        setCode('');
        setLabel('');
        setIcon('🏆');
        setDescription('');
        setXpReward('0');
        setIsAutomatic(false);
        setSelectedTemplate('');
    };

    const handleTemplateSelect = (templateCode: string) => {
        setSelectedTemplate(templateCode);

        if (!templateCode) {
            resetForm();
            return;
        }

        const template = ALL_TEMPLATES.find((t) => t.code === templateCode);
        if (!template) return;

        setCode(template.code);
        setLabel(template.label);
        setIcon(template.icon);
        setDescription(template.description);
        setXpReward(String(template.xpReward));
        setIsAutomatic(template.isAutomatic);
    };

    const handleCreate = async () => {
        if (!code.trim() || !label.trim() || !organizationId) return;
        setSaving(true);
        setError('');

        try {
            await api.createAchievement(organizationId, {
                code: code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                label: label.trim(),
                icon: icon || undefined,
                description: description.trim() || undefined,
                xpReward: Number(xpReward) || 0,
                isAutomatic,
            });
            resetForm();
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить ачивку? У всех, кто её получил, она исчезнет.')) return;
        try {
            await api.deleteAchievement(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title">
                <span className="settings-title-icon">
                    <Settings size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Настройки проекта
            </h1>

            {error && <div className="settings-error">{error}</div>}

            <div className="settings-section">
                <div className="settings-section-header">
                    <h2 className="settings-section-title">
                        <Trophy size={20} />
                        Ачивки организации ({achievements.length})
                        <InfoPopup title="Что такое ачивки?">
                            <p>
                                <strong>Ачивки</strong> — это награды, которые
                                получают сотрудники за достижения.
                            </p>
                            <p>
                                <strong>Два типа:</strong>
                            </p>
                            <ul>
                                <li>
                                    <strong>Автоматические</strong> — система сама выдаёт
                                    за объективные результаты: закрыл 10 задач, завершил
                                    спринт без просрочек. Выбирай из списка готовых —
                                    у них уже прописан правильный код.
                                </li>
                                <li>
                                    <strong>Ручные</strong> — PO, ментор или админ
                                    награждает вручную за нестандартное: идею, помощь
                                    коллеге, героизм. Код придумываешь сам.
                                </li>
                            </ul>
                            <p>
                                <strong>Иконка</strong> — эмодзи (🏆, 💎, 🔥).
                            </p>
                            <p>
                                <strong>XP</strong> — сколько опыта получит сотрудник
                                за эту ачивку.
                            </p>
                        </InfoPopup>
                    </h2>

                    {!showForm && (
                        <Button
                            onClick={() => setShowForm(true)}
                            style={{ width: 'auto', padding: '10px 20px' }}
                        >
                            <Plus size={16} />
                            Новая ачивка
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className="settings-achievement-form">
                        <h3 className="settings-achievement-form-title">Новая ачивка</h3>

                        <div className="settings-achievement-form-field">
                            <label className="settings-achievement-form-label">
                                Тип ачивки
                            </label>
                            <select
                                className="settings-achievement-form-select"
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                            >
                                <option value="">— Своя (ввести вручную) —</option>

                                <optgroup label="🤖 Автоматические (система выдаёт сама)">
                                    {AUTOMATIC_TEMPLATES.map((t) => (
                                        <option key={t.code} value={t.code}>
                                            {t.icon} {t.label} · +{t.xpReward} XP
                                        </option>
                                    ))}
                                </optgroup>

                                <optgroup label="🎁 Ручные (PO награждает)">
                                    {MANUAL_TEMPLATES.map((t) => (
                                        <option key={t.code} value={t.code}>
                                            {t.icon} {t.label} · +{t.xpReward} XP
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <span className="settings-achievement-form-hint">
                                Автоматические ачивки выдают сами — по коду из списка.
                                Ручную создаёшь сам, код и условия — твои.
                            </span>
                        </div>

                        <div className="settings-achievement-form-row">
                            <Input
                                label="Код (латиница, snake_case)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="first_task"
                                disabled={!!selectedTemplate}
                            />
                            <Input
                                label="Иконка (эмодзи)"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="🏆"
                                disabled={!!selectedTemplate}
                            />
                        </div>

                        <Input
                            label="Название"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Первая задача"
                            disabled={!!selectedTemplate}
                        />

                        <Input
                            label="Описание (опционально)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="За что выдаётся"
                            disabled={!!selectedTemplate}
                        />

                        <div className="settings-achievement-form-row">
                            <Input
                                label="XP"
                                type="number"
                                value={xpReward}
                                onChange={(e) => setXpReward(e.target.value)}
                            />
                            <div className="settings-achievement-checkbox-wrapper">
                                <label className="settings-achievement-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isAutomatic}
                                        onChange={(e) => setIsAutomatic(e.target.checked)}
                                        disabled={!!selectedTemplate}
                                    />
                                    Автоматическая
                                </label>
                                <span className="settings-achievement-checkbox-hint">
                                    Система выдаёт сама (по триггеру)
                                </span>
                            </div>
                        </div>

                        <div className="settings-achievement-form-actions">
                            <Button
                                onClick={handleCreate}
                                loading={saving}
                                disabled={!code.trim() || !label.trim()}
                            >
                                <Plus size={16} /> Создать
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                variant="secondary"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="settings-achievements-loading">Загрузка...</div>
                ) : achievements.length === 0 ? (
                    <div className="settings-achievements-empty">
                        Пока нет ачивок. Создай первую — например, «Первая задача» (🏆, код <code>first_task</code>).
                    </div>
                ) : (
                    <div className="settings-achievements-list">
                        {achievements.map((a) => (
                            <div key={a.id} className="settings-achievement-item">
                                <div className="settings-achievement-icon">
                                    {a.icon ?? '🏆'}
                                </div>
                                <div className="settings-achievement-content">
                                    <div className="settings-achievement-label">
                                        {a.label}
                                        {a.isAutomatic && (
                                            <span className="settings-achievement-badge-auto">
                                                авто
                                            </span>
                                        )}
                                    </div>
                                    <div className="settings-achievement-code">
                                        #{a.code}
                                    </div>
                                    {a.description && (
                                        <div className="settings-achievement-desc">
                                            {a.description}
                                        </div>
                                    )}
                                </div>
                                {a.xpReward > 0 && (
                                    <div className="settings-achievement-xp">
                                        +{a.xpReward} XP
                                    </div>
                                )}
                                <button
                                    className="settings-achievement-delete"
                                    onClick={() => handleDelete(a.id)}
                                    title="Удалить"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Settings size={20} />
                    Общие настройки
                </h2>
                <div className="settings-empty">
                    <p>Название, описание, роли, интеграции, вебхуки — в разработке.</p>
                </div>
            </div>
        </div>
    );
}