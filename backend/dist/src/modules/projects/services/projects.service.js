var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//backend\src\modules\projects\services\projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async update(id, data) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });
        if (!project)
            throw new NotFoundException('Project not found');
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
    async findById(id) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });
        if (!project)
            throw new NotFoundException('Project not found');
        return project;
    }
    async findByWorkspace(workspaceId) {
        return this.prisma.client.project.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async archive(id) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });
        if (!project)
            throw new NotFoundException('Project not found');
        return this.prisma.client.project.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }
    async remove(id) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });
        if (!project)
            throw new NotFoundException('Project not found');
        return this.prisma.client.project.delete({
            where: { id },
        });
    }
};
ProjectsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ProjectsService);
export { ProjectsService };
//# sourceMappingURL=projects.service.js.map