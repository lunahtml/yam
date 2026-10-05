//frontend/src/features/gamification/achievementTemplates.ts

export interface AchievementTemplate {
    code: string;
    label: string;
    icon: string;
    description: string;
    xpReward: number;
    isAutomatic: boolean;
}

export const AUTOMATIC_TEMPLATES: AchievementTemplate[] = [
    // ─── Задачи ───
    {
        code: 'first_task',
        label: 'Первая задача',
        icon: '🎯',
        description: 'Закрыл первую задачу в спринте',
        xpReward: 50,
        isAutomatic: true,
    },
    {
        code: 'ten_tasks',
        label: 'Десятка',
        icon: '🔥',
        description: 'Закрыл 10 задач в спринте',
        xpReward: 150,
        isAutomatic: true,
    },
    {
        code: 'fifty_tasks',
        label: 'Полтинник',
        icon: '💎',
        description: 'Закрыл 50 задач в спринте',
        xpReward: 500,
        isAutomatic: true,
    },
    // ─── Спринты ───
    {
        code: 'first_sprint',
        label: 'Первый спринт',
        icon: '🚀',
        description: 'Завершил первый спринт',
        xpReward: 200,
        isAutomatic: true,
    },
    {
        code: 'ten_sprints',
        label: 'Марафонец',
        icon: '🏃',
        description: 'Завершил 10 спринтов',
        xpReward: 1000,
        isAutomatic: true,
    },
    // ─── Инкременты ───
    {
        code: 'first_increment',
        label: 'Первый инкремент',
        icon: '📦',
        description: 'Создал первый инкремент',
        xpReward: 100,
        isAutomatic: true,
    },
    {
        code: 'ten_increments',
        label: 'Инкрементатор',
        icon: '⚡',
        description: 'Создал 10 инкрементов',
        xpReward: 400,
        isAutomatic: true,
    },
    // ─── События ───
    {
        code: 'first_event',
        label: 'Летописец',
        icon: '📖',
        description: 'Записал первое событие в спринте',
        xpReward: 75,
        isAutomatic: true,
    },
    // ─── Ретро ───
    {
        code: 'first_retro',
        label: 'Рефлексия',
        icon: '🪞',
        description: 'Провёл первую ретроспективу',
        xpReward: 100,
        isAutomatic: true,
    },
    {
        code: 'ten_retros',
        label: 'Мудрец',
        icon: '🦉',
        description: 'Провёл 10 ретроспектив',
        xpReward: 500,
        isAutomatic: true,
    },
];

export const MANUAL_TEMPLATES: AchievementTemplate[] = [
    {
        code: 'hero',
        label: 'Героизм',
        icon: '🦸',
        description: 'За спасение проекта в критический момент',
        xpReward: 300,
        isAutomatic: false,
    },
    {
        code: 'idea',
        label: 'Идея',
        icon: '💡',
        description: 'За нестандартную идею, которая сработала',
        xpReward: 150,
        isAutomatic: false,
    },
    {
        code: 'mentor_award',
        label: 'Наставник',
        icon: '🎓',
        description: 'За обучение и поддержку коллег',
        xpReward: 200,
        isAutomatic: false,
    },
    {
        code: 'helper',
        label: 'Помощь коллеге',
        icon: '🤝',
        description: 'За помощь товарищу в трудной ситуации',
        xpReward: 100,
        isAutomatic: false,
    },
    {
        code: 'expert',
        label: 'Экспертиза',
        icon: '🧠',
        description: 'За глубокую экспертизу в сложном вопросе',
        xpReward: 250,
        isAutomatic: false,
    },
    {
        code: 'star',
        label: 'Звезда команды',
        icon: '🌟',
        description: 'За поддержку духа команды',
        xpReward: 150,
        isAutomatic: false,
    },
    {
        code: 'creative',
        label: 'Креатив',
        icon: '🎪',
        description: 'За творческий подход к задаче',
        xpReward: 150,
        isAutomatic: false,
    },
    {
        code: 'terminator',
        label: 'Терминатор',
        icon: '🔥',
        description: 'За рекордную скорость выполнения',
        xpReward: 200,
        isAutomatic: false,
    },
    {
        code: 'diamond',
        label: 'Бриллиант',
        icon: '💎',
        description: 'За безупречное качество работы',
        xpReward: 300,
        isAutomatic: false,
    },
];

export const ALL_TEMPLATES: AchievementTemplate[] = [
    ...AUTOMATIC_TEMPLATES,
    ...MANUAL_TEMPLATES,
];

export const TEMPLATE_CODES = new Set(ALL_TEMPLATES.map((t) => t.code));