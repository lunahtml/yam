//backend/src/modules/users/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { UpdateUserDto } from '../contracts/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getMe(userId: string) {
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

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateMe(userId: string, data: UpdateUserDto) {
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

    async findById(id: string) {
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

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
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

    async search(query: string, limit = 20) {
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
}