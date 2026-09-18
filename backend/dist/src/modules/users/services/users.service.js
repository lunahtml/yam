var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend/src/modules/users/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new NotFoundException('User not found');
        return user;
    }
    async updateMe(userId, data) {
        return this.prisma.client.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                avatarUrl: data.avatarUrl || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                status: true,
            },
        });
    }
    async findById(id) {
        const user = await this.prisma.client.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                status: true,
            },
        });
        if (!user)
            throw new NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.prisma.client.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
            },
        });
    }
    async search(query, limit = 20) {
        return this.prisma.client.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
                status: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
            },
            take: limit,
        });
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map