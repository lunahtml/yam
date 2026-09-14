//backend\src\modules\projects\services\projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import {
    CreateProjectDto,
    UpdateProjectDto,
} from '../contracts/create-project.dto.js';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProjectDto) {
        return this.prisma.client.project.create({
            data: {
                workspaceId: data.workspaceId,
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async update(id: string, data: UpdateProjectDto) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.client.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async findById(id: string) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async findByWorkspace(workspaceId: string) {
        return this.prisma.client.project.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async archive(id: string) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.client.project.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }

    async remove(id: string) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.client.project.delete({
            where: { id },
        });
    }
}