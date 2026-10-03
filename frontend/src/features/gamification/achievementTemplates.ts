//frontend/src/features/gamification/achievementTemplates.ts

export interface AchievementTemplate {
    code: string;
    label: string;
    icon: string;
    description: string;
    xpReward: number;
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
    {
        code: 'first_task',
        label: 'Первая задача',
        icon: '🎯',
        description: 'Закрыл первую задачу в спринте',
        xpReward: 50,
    },
    {
        code: 'ten_tasks',
        label: 'Десятка',
        icon: '🔥',
        description: 'Закрыл 10 задач в спринте',
        xpReward: 150,
    },
    {
        code: 'fifty_tasks',
        label: 'Полтинник',
        icon: '💎',
        description: 'Закрыл 50 задач в спринте',
        xpReward: 500,
    },
    {
        code: 'first_sprint',
        label: 'Первый спринт',
        icon: '🚀',
        description: 'Завершил первый спринт',
        xpReward: 200,
    },
    {
        code: 'first_increment',
        label: 'Первый инкремент',
        icon: '📦',
        description: 'Создал первый инкремент',
        xpReward: 100,
    },
    {
        code: 'metric_achieved',
        label: 'Метрика достигнута',
        icon: '📈',
        description: 'Достиг метрики спринта',
        xpReward: 100,
    },
    {
        code: 'team_player',
        label: 'Командный игрок',
        icon: '🤝',
        description: 'Помог коллеге с задачей',
        xpReward: 75,
    },
];

export const TEMPLATE_CODES = new Set(
    ACHIEVEMENT_TEMPLATES.map((t) => t.code),
);