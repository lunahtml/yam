var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/utm/services/defaults.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
const DEFAULT_SOURCES = [
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
const DEFAULT_MEDIUMS = [
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
let UtmDefaultsService = class UtmDefaultsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Создать дефолтные справочники для нового проекта.
     * Вызывается при создании проекта.
     */
    async createDefaults(projectId) {
        await this.prisma.client.utmSource.createMany({
            data: DEFAULT_SOURCES.map((s) => ({
                projectId,
                name: s.name,
                label: s.label,
                icon: s.icon,
                isSystem: true,
            })),
            skipDuplicates: true,
        });
        await this.prisma.client.utmMedium.createMany({
            data: DEFAULT_MEDIUMS.map((m) => ({
                projectId,
                name: m.name,
                label: m.label,
                isSystem: true,
            })),
            skipDuplicates: true,
        });
        // Дефолтное правило
        await this.prisma.client.utmRule.create({
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
};
UtmDefaultsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UtmDefaultsService);
export { UtmDefaultsService };
//# sourceMappingURL=defaults.service.js.map