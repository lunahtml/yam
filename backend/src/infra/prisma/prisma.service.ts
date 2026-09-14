//backend\src\infra\prisma\prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService {
    private _client: PrismaClient;

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });

        this._client = new PrismaClient({ adapter });
    }

    get client(): PrismaClient {
        return this._client;
    }
}