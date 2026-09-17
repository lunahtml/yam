var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//backend/src/modules/utm/services/url-builder.service.ts
import { Injectable } from '@nestjs/common';
let UrlBuilderService = class UrlBuilderService {
    build(baseUrl, params) {
        const url = new URL(baseUrl);
        url.searchParams.set('utm_source', params.source);
        url.searchParams.set('utm_medium', params.medium);
        if (params.campaign) {
            url.searchParams.set('utm_campaign', params.campaign);
        }
        if (params.content) {
            url.searchParams.set('utm_content', params.content);
        }
        if (params.term) {
            url.searchParams.set('utm_term', params.term);
        }
        return url.toString();
    }
    /**
     * Подставляет переменные в шаблон.
     * Поддерживает: {{source}}, {{medium}}, {{campaign}}, {{index}},
     * {{artifact.name}}, {{artifact.type}}, {{date}}
     */
    renderTemplate(template, vars) {
        return template.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
            const trimmed = String(key).trim();
            const value = vars[trimmed];
            return value !== undefined ? String(value) : '';
        });
    }
};
UrlBuilderService = __decorate([
    Injectable()
], UrlBuilderService);
export { UrlBuilderService };
//# sourceMappingURL=url-builder.service.js.map