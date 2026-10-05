//frontend/src/features/sprints/CompleteSprintModal.tsx
import { useState } from 'react';
import { X, Flag, CheckCircle2, ArrowRightLeft, Archive, Ban, Plus } from 'lucide-react';
import { SprintGoal, GoalStatus } from '../../types/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InfoPopup from '../../components/InfoPopup';
import './CompleteSprintModal.css';

type GoalAction = 'ACHIEVED' | 'CARRIED_OVER' | 'MOVED_BACKLOG' | 'CANCELLED';

interface CompleteSprintModalProps {
    sprintName: string;
    goals: SprintGoal[];
    onClose: () => void;
    onConfirm: (data: {
        goals: { id: string; action: GoalAction }[];
        createNextSprint: boolean;
        nextSprint?: {
            name: string;
            startDate: string;
            endDate: string;
            goal?: string;
        };
        carryOverTasks: boolean;
    }) => Promise<void>;
}

const ACTIONS: {
    key: GoalAction;
    label: string;
    icon: typeof CheckCircle2;
    cls: string;
    hint: string;
}[] = [
        {
            key: 'ACHIEVED',
            label: 'Завершена',
            icon: CheckCircle2,
            cls: 'goal-action-achieved',
            hint: 'Цель достигнута',
        },
        {
            key: 'CARRIED_OVER',
            label: 'Перенести',
            icon: ArrowRightLeft,
            cls: 'goal-action-carried',
            hint: 'Перейдёт в следующий спринт',
        },
        {
            key: 'MOVED_BACKLOG',
            label: 'В бэклог',
            icon: Archive,
            cls: 'goal-action-backlog',
            hint: 'Вернёмся когда-нибудь',
        },
        {
            key: 'CANCELLED',
            label: 'Отменить',
            icon: Ban,
            cls: 'goal-action-cancelled',
            hint: 'Больше не актуальна',
        },
    ];

export default function CompleteSprintModal({
    sprintName,
    goals,
    onClose,
    onConfirm,
}: CompleteSprintModalProps) {
    const [goalActions, setGoalActions] = useState<Record<string, GoalAction>>(
        () => {
            const initial: Record<string, GoalAction> = {};
            for (const g of goals) {
                initial[g.id] = 'ACHIEVED';
            }
            return initial;
        },
    );

    const [createNextSprint, setCreateNextSprint] = useState(true);
    const [carryOverTasks, setCarryOverTasks] = useState(true);

    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(defaultStart.getDate() + 1);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 14);

    const [nextName, setNextName] = useState('Спринт #N');
    const [nextGoal, setNextGoal] = useState('');
    const [nextStartDate, setNextStartDate] = useState(
        defaultStart.toISOString().slice(0, 10),
    );
    const [nextEndDate, setNextEndDate] = useState(
        defaultEnd.toISOString().slice(0, 10),
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setError('');

        const goalsPayload = goals.map((g) => ({
            id: g.id,
            action: goalActions[g.id] ?? 'ACHIEVED',
        }));

        if (createNextSprint && (!nextName.trim() || !nextStartDate || !nextEndDate)) {
            setError('Заполни название и даты нового спринта');
            return;
        }

        setSaving(true);
        try {
            await onConfirm({
                goals: goalsPayload,
                createNextSprint,
                nextSprint: createNextSprint
                    ? {
                        name: nextName.trim(),
                        startDate: nextStartDate,
                        endDate: nextEndDate,
                        goal: nextGoal.trim() || undefined,
                    }
                    : undefined,
                carryOverTasks,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="complete-sprint-overlay" onClick={onClose}>
            <div className="complete-sprint" onClick={(e) => e.stopPropagation()}>
                <div className="complete-sprint-header">
                    <h2 className="complete-sprint-title">
                        <Flag size={20} />
                        Завершение спринта
                        <InfoPopup title="Как завершить спринт?">
                            <p>
                                <strong>Завершение спринта</strong> — это ритуал,
                                когда команда оценивает, что удалось, а что нет.
                            </p>
                            <p>
                                <strong>По каждой цели</strong> выбери одно из четырёх:
                            </p>
                            <ul>
                                <li>
                                    <strong>Завершена</strong> — цель достигнута.
                                </li>
                                <li>
                                    <strong>Перенести</strong> — цель важна, но не
                                    успели. Перейдёт в следующий спринт.
                                </li>
                                <li>
                                    <strong>В бэклог</strong> — вернёмся позже,
                                    когда будет время.
                                </li>
                                <li>
                                    <strong>Отменить</strong> — цель больше не
                                    актуальна.
                                </li>
                            </ul>
                            <p>
                                <strong>Новый спринт</strong> создаётся
                                автоматически — ты задаёшь название и даты.
                            </p>
                            <p>
                                <strong>Задачи</strong> — незавершённые можно
                                перенести в новый спринт (рекомендуется).
                            </p>
                        </InfoPopup>
                    </h2>
                    <button className="complete-sprint-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="complete-sprint-body">
                    <div className="complete-sprint-sprint-name">
                        {sprintName}
                    </div>

                    {error && <div className="complete-sprint-error">{error}</div>}

                    {goals.length > 0 && (
                        <div className="complete-sprint-section">
                            <h3 className="complete-sprint-section-title">
                                Оцени цели ({goals.length})
                            </h3>

                            <div className="complete-sprint-goals">
                                {goals.map((g) => (
                                    <div key={g.id} className="complete-goal">
                                        <div className="complete-goal-text">
                                            {g.text}
                                        </div>

                                        <div className="complete-goal-actions">
                                            {ACTIONS.map((a) => {
                                                const Icon = a.icon;
                                                const active = goalActions[g.id] === a.key;
                                                return (
                                                    <button
                                                        key={a.key}
                                                        type="button"
                                                        className={`complete-goal-action ${a.cls} ${active ? 'complete-goal-action-active' : ''}`}
                                                        onClick={() =>
                                                            setGoalActions({
                                                                ...goalActions,
                                                                [g.id]: a.key,
                                                            })
                                                        }
                                                        title={a.hint}
                                                    >
                                                        <Icon size={14} />
                                                        {a.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="complete-sprint-section">
                        <label className="complete-sprint-checkbox">
                            <input
                                type="checkbox"
                                checked={createNextSprint}
                                onChange={(e) => setCreateNextSprint(e.target.checked)}
                            />
                            Создать следующий спринт
                        </label>

                        {createNextSprint && (
                            <div className="complete-sprint-next-form">
                                <Input
                                    label="Название"
                                    value={nextName}
                                    onChange={(e) => setNextName(e.target.value)}
                                    placeholder="Спринт #2"
                                />

                                <Input
                                    label="Цель следующего спринта"
                                    value={nextGoal}
                                    onChange={(e) => setNextGoal(e.target.value)}
                                    placeholder="Что хотим достичь"
                                />

                                <div className="complete-sprint-dates">
                                    <Input
                                        label="Начало"
                                        type="date"
                                        value={nextStartDate}
                                        onChange={(e) => setNextStartDate(e.target.value)}
                                    />
                                    <Input
                                        label="Конец"
                                        type="date"
                                        value={nextEndDate}
                                        onChange={(e) => setNextEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {createNextSprint && (
                        <div className="complete-sprint-section">
                            <label className="complete-sprint-checkbox">
                                <input
                                    type="checkbox"
                                    checked={carryOverTasks}
                                    onChange={(e) => setCarryOverTasks(e.target.checked)}
                                />
                                Перенести незавершённые задачи в новый спринт
                            </label>
                        </div>
                    )}
                </div>

                <div className="complete-sprint-footer">
                    <Button onClick={handleConfirm} loading={saving}>
                        <CheckCircle2 size={16} />
                        Завершить спринт
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Отмена
                    </Button>
                </div>
            </div>
        </div>
    );
}