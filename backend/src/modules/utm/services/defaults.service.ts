//backend/src/modules/utm/services/defaults.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

interface DefaultSource {
    name: string;
    label: string;
    icon: string;
}

interface DefaultMedium {
    name: string;
    label: string;
}

const DEFAULT_SOURCES: DefaultSource[] = [
    { name: 'telegram', label: 'Telegram', icon: '✈️' },
    { name: 'vk', label: 'VK', icon: '🅱️' },
    { name: 'yandex', label: 'Яндекс', icon: '🔴' },
    { name: 'google', label: 'Google', icon: '🟡' },
    { name: 'email', label: 'Email', icon: '📧' },
    { name: 'instagram', label: 'Instagram', icon: '📷' },
    { name: 'youtube', label: 'YouTube', icon: '▶️' },
    { name: 'rutube', label: 'Rutube', icon: '🎬' },
    { name: 'offline', label: 'Офлайн', icon: '🏢' },
    { name: 'affiliate', label: 'Партнёры', icon: '🤝' },
];

const DEFAULT_MEDIUMS: DefaultMedium[] = [
    { name: 'social', label: 'Соцсети' },
    { name: 'cpc', label: 'Реклама (CPC)' },
    { name: 'email', label: 'Email' },
    { name: 'banner', label: 'Баннер' },
    { name: 'referral', label: 'Referral' },
    { name: 'organic', label: 'Органика' },
    { name: 'offline', label: 'Офлайн' },
    { name: 'qr', label: 'QR-код' },
    { name: 'messenger', label: 'Мессенджер' },
    { name: 'video', label: 'Видео' },
];

@Injectable()
export class UtmDefaultsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Создать дефолтные справочники для нового проекта.
     * Вызывается при создании проекта.
     *
     * @param tx — опциональный транзакционный клиент.
     *             Если передан — работаем внутри существующей транзакции.
     */
    async createDefaults(
        projectId: string,
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx ?? this.prisma.client;

        await client.utmSource.createMany({
            data: DEFAULT_SOURCES.map((s) => ({
                projectId,
                name: s.name,
                label: s.label,
                icon: s.icon,
                isSystem: true,
            })),
            skipDuplicates: true,
        });

        await client.utmMedium.createMany({
            data: DEFAULT_MEDIUMS.map((m) => ({
                projectId,
                name: m.name,
                label: m.label,
                isSystem: true,
            })),
            skipDuplicates: true,
        });

        await client.utmRule.create({
            data: {
                projectId,
                name: 'Основное правило',
                description: 'Автозаполнение UTM для типовых случаев',
                priority: 0,
                isActive: true,
                conditions: [],
                sourceTemplate: '{{source}}',
                mediumTemplate: '{{medium}}',
                campaignTemplate: '{{campaign}}',
                contentTemplate: null,
                termTemplate: null,
            },
        });
    }
}