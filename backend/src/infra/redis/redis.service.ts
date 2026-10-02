//backend/src/infra/redis/redis.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL ?? 'redis://redis:6379',
            password: process.env.REDIS_PASSWORD ?? 'redis_secret',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        this.logger.error('Redis: too many reconnect attempts');
                        return new Error('Redis reconnect failed');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });

        this.client.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
        });

        this.client.on('connect', () => {
            this.logger.log('Redis connected');
        });
    }

    async onModuleInit() {
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
        await this.client.setEx(key, ttlSeconds, value);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }


    async revokeJti(jti: string, ttlSeconds: number): Promise<void> {
        await this.setex(`jwt:denylist:${jti}`, ttlSeconds, '1');
    }

    async isJtiRevoked(jti: string): Promise<boolean> {
        return this.exists(`jwt:denylist:${jti}`);
    }
}