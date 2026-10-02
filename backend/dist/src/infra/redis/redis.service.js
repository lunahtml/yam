var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
//backend/src/infra/redis/redis.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
let RedisService = RedisService_1 = class RedisService {
    logger = new Logger(RedisService_1.name);
    client;
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
    async setex(key, ttlSeconds, value) {
        await this.client.setEx(key, ttlSeconds, value);
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    async del(key) {
        await this.client.del(key);
    }
    async revokeJti(jti, ttlSeconds) {
        await this.setex(`jwt:denylist:${jti}`, ttlSeconds, '1');
    }
    async isJtiRevoked(jti) {
        return this.exists(`jwt:denylist:${jti}`);
    }
};
RedisService = RedisService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], RedisService);
export { RedisService };
//# sourceMappingURL=redis.service.js.map