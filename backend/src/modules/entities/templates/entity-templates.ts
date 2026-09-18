//backend\src\modules\entities\templates\entity-templates.ts
export interface EntityTemplate {
    key: string;
    label: string;
    description: string;
    icon: string;
    entity: {
        name: string;
        label: string;
        icon: string;
    };
    fields: {
        name: string;
        label: string;
        type: string;
        isRequired?: boolean;
        options?: Record<string, unknown>;
    }[];
    defaultView: {
        name: string;
        type: 'KANBAN' | 'TABLE' | 'LIST' | 'CALENDAR';
        config: Record<string, unknown>;
    };
}

export const ENTITY_TEMPLATES: EntityTemplate[] = [
    {
        key: 'task',
        label: 'Задачи',
        description: 'Канбан-доска для задач и багов',
        icon: '',
        entity: {
            name: 'tasks',
            label: 'Задачи',
            icon: '',
        },
        fields: [
            { name: 'title', label: 'Заголовок', type: 'text', isRequired: true },
            { name: 'description', label: 'Описание', type: 'text' },
            {
                name: 'status',
                label: 'Статус',
                type: 'select',
                isRequired: true,
                options: {
                    choices: ['backlog', 'todo', 'in_progress', 'review', 'done'],
                },
            },
            {
                name: 'priority',
                label: 'Приоритет',
                type: 'select',
                options: { choices: ['low', 'medium', 'high', 'urgent'] },
            },
            { name: 'assignee', label: 'Исполнитель', type: 'user' },
            { name: 'coAssignees', label: 'Соисполнители', type: 'user-list' },
            { name: 'watchers', label: 'Наблюдатели', type: 'user-list' },
            { name: 'startDate', label: 'Дата начала', type: 'date' },
            { name: 'dueDate', label: 'Дедлайн', type: 'date' },
            { name: 'tags', label: 'Теги', type: 'tags' },
            { name: 'checklist', label: 'Чек-лист', type: 'checklist' },
            { name: 'estimate', label: 'Оценка (часы)', type: 'number' },
            { name: 'sprintId', label: 'Спринт', type: 'text' },
            { name: 'epicId', label: 'Эпик', type: 'text' },
        ],
        defaultView: {
            name: 'Канбан',
            type: 'KANBAN',
            config: { groupBy: 'status' },
        },
    },
    {
        key: 'client',
        label: 'Клиенты',
        description: 'База клиентов',
        icon: '',
        entity: { name: 'clients', label: 'Клиенты', icon: '👥' },
        fields: [
            { name: 'name', label: 'Имя', type: 'text', isRequired: true },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'phone', label: 'Телефон', type: 'text' },
            { name: 'company', label: 'Компания', type: 'text' },
            {
                name: 'status',
                label: 'Статус',
                type: 'select',
                options: { choices: ['active', 'inactive', 'churned'] },
            },
        ],
        defaultView: {
            name: 'Таблица',
            type: 'TABLE',
            config: {},
        },
    },
    {
        key: 'lead',
        label: 'Лиды',
        description: 'Воронка лидов',
        icon: '',
        entity: { name: 'leads', label: 'Лиды', icon: '' },
        fields: [
            { name: 'name', label: 'Имя', type: 'text', isRequired: true },
            { name: 'source', label: 'Источник', type: 'text' },
            {
                name: 'status',
                label: 'Статус',
                type: 'select',
                options: {
                    choices: ['new', 'mql', 'sql', 'meeting', 'deal', 'lost'],
                },
            },
            { name: 'amount', label: 'Сумма', type: 'number' },
        ],
        defaultView: {
            name: 'Воронка',
            type: 'KANBAN',
            config: { groupBy: 'status' },
        },
    },
    {
        key: 'order',
        label: 'Заказы',
        description: 'Заказы клиентов',
        icon: '',
        entity: { name: 'orders', label: 'Заказы', icon: '' },
        fields: [
            { name: 'number', label: 'Номер', type: 'text', isRequired: true },
            { name: 'amount', label: 'Сумма', type: 'number' },
            {
                name: 'status',
                label: 'Статус',
                type: 'select',
                options: { choices: ['new', 'paid', 'shipped', 'delivered'] },
            },
            { name: 'dueDate', label: 'Дата', type: 'date' },
        ],
        defaultView: {
            name: 'Таблица',
            type: 'TABLE',
            config: {},
        },
    },
    {
        key: 'content',
        label: 'Контент-план',
        description: 'Публикации и посты',
        icon: '',
        entity: { name: 'content', label: 'Контент', icon: '' },
        fields: [
            { name: 'title', label: 'Заголовок', type: 'text', isRequired: true },
            { name: 'channel', label: 'Канал', type: 'text' },
            {
                name: 'status',
                label: 'Статус',
                type: 'select',
                options: { choices: ['idea', 'draft', 'review', 'published'] },
            },
            { name: 'publishDate', label: 'Дата публикации', type: 'date' },
        ],
        defaultView: {
            name: 'Канбан',
            type: 'KANBAN',
            config: { groupBy: 'status' },
        },
    },
];